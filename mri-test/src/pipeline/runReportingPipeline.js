import { randomUUID } from "node:crypto";
import { DEFAULT_REPORT_INPUT } from "../config/defaults.js";
import {
  getPipelineConfig,
  normalizeBodyPart,
  normalizeModality,
} from "../config/pipelines.js";
import { assertReadableImagePath } from "../llm/imageInput.js";
import { createOpenAIReportingClient } from "../llm/reportingClient.js";
import {
  FindingsExtractionSchema,
  ReportAssemblySchema,
} from "../schemas/reportingSchemas.js";
import { runQualityCheck } from "./steps/qualityCheck.js";

function makeStepStatus(status = "pending") {
  return {
    status,
    validated: false,
    errors: [],
    skippedReason: null,
  };
}

function makeBaseResponse({ reportId, input, createdAt }) {
  return {
    reportId,
    status: "partial",
    metadata: {
      modality: input.modality,
      normalizedModality: normalizeModality(input.modality),
      bodyPart: input.bodyPart,
      normalizedBodyPart: normalizeBodyPart(input.bodyPart),
      clinicalContext: input.clinicalContext,
      imagePath: input.imagePath,
      pipelineId: null,
      createdAt,
      completedAt: null,
    },
    findings: [],
    report: {
      sections: null,
      impression: [],
      recommendations: [],
      urgency: {
        flag: false,
        level: "routine",
        reason: "Report assembly did not run.",
      },
      confidence: {
        overall: 0,
        rationale: "No assembled report is available.",
      },
      caveats: [],
    },
    confidence: {
      findingsOverall: 0,
      reportOverall: 0,
      lowConfidenceFindingIds: [],
    },
    quality: {
      passed: false,
      warnings: [],
    },
    steps: {
      intake: makeStepStatus("pending"),
      routing: makeStepStatus("pending"),
      extractFindings: makeStepStatus("pending"),
      assembleReport: makeStepStatus("pending"),
      qualityCheck: makeStepStatus("pending"),
    },
  };
}

function formatError(error) {
  if (!error) return "Unknown error";

  if (error.issues?.length) {
    return error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
  }

  return error.message || String(error);
}

function skipStep(step, reason) {
  step.status = "skipped";
  step.skippedReason = reason;
}

function completeResponse(response, status) {
  response.status = status;
  response.metadata.completedAt = new Date().toISOString();
  return response;
}

async function emitProgress(onProgress, payload) {
  await onProgress({
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

export async function runReportingPipeline(inputOverrides = {}, options = {}) {
  const reportId = options.reportId || randomUUID();
  const createdAt = new Date().toISOString();
  const input = { ...DEFAULT_REPORT_INPUT, ...inputOverrides };
  const onProgress = options.onProgress || (() => {});
  const response = makeBaseResponse({ reportId, input, createdAt });

  await emitProgress(onProgress, { step: "intake", status: "running" });

  try {
    await assertReadableImagePath(input.imagePath);
    response.steps.intake.status = "completed";
    response.steps.intake.validated = true;
    await emitProgress(onProgress, { step: "intake", status: "completed" });
  } catch (error) {
    response.steps.intake.status = "failed";
    response.steps.intake.errors.push(formatError(error));
    skipStep(response.steps.routing, "Intake failed.");
    skipStep(response.steps.extractFindings, "Intake failed.");
    skipStep(response.steps.assembleReport, "Intake failed.");
    skipStep(response.steps.qualityCheck, "Intake failed.");
    await emitProgress(onProgress, {
      step: "intake",
      status: "failed",
      error: formatError(error),
    });
    return completeResponse(response, "failed");
  }

  await emitProgress(onProgress, { step: "routing", status: "running" });
  const pipeline = getPipelineConfig(input);

  if (!pipeline) {
    const error = `No pipeline configured for modality '${input.modality}' and body part '${input.bodyPart}'.`;
    response.steps.routing.status = "failed";
    response.steps.routing.errors.push(error);
    skipStep(response.steps.extractFindings, "Routing failed.");
    skipStep(response.steps.assembleReport, "Routing failed.");
    skipStep(response.steps.qualityCheck, "Routing failed.");
    await emitProgress(onProgress, { step: "routing", status: "failed", error });
    return completeResponse(response, "failed");
  }

  response.metadata.pipelineId = pipeline.id;
  response.steps.routing.status = "completed";
  response.steps.routing.validated = true;
  await emitProgress(onProgress, {
    step: "routing",
    status: "completed",
    pipelineId: pipeline.id,
  });

  const llmClient =
    options.llmClient || createOpenAIReportingClient({ modelName: pipeline.model });

  let findingsOutput;

  await emitProgress(onProgress, { step: "extractFindings", status: "running" });

  try {
    const rawFindingsOutput = await llmClient.extractFindings({
      imagePath: input.imagePath,
      metadata: response.metadata,
      pipeline,
    });
    findingsOutput = FindingsExtractionSchema.parse(rawFindingsOutput);

    response.findings = findingsOutput.findings;
    response.confidence.findingsOverall = findingsOutput.overallConfidence;
    response.report.caveats = findingsOutput.limitations;
    response.steps.extractFindings.status = "completed";
    response.steps.extractFindings.validated = true;

    await emitProgress(onProgress, {
      step: "extractFindings",
      status: "completed",
      findingCount: findingsOutput.findings.length,
    });
  } catch (error) {
    const message = `Call 1 returned malformed output or failed: ${formatError(error)}`;
    response.steps.extractFindings.status = "failed";
    response.steps.extractFindings.errors.push(message);
    skipStep(
      response.steps.assembleReport,
      "Report assembly skipped because findings were not validated."
    );
    skipStep(
      response.steps.qualityCheck,
      "Quality check skipped because report assembly did not run."
    );
    await emitProgress(onProgress, {
      step: "extractFindings",
      status: "failed",
      error: message,
    });
    return completeResponse(response, "partial");
  }

  let reportOutput;

  await emitProgress(onProgress, { step: "assembleReport", status: "running" });

  try {
    const rawReportOutput = await llmClient.assembleReport({
      metadata: response.metadata,
      findingsOutput,
      pipeline,
    });
    reportOutput = ReportAssemblySchema.parse(rawReportOutput);

    response.report = reportOutput;
    response.confidence.reportOverall = reportOutput.confidence.overall;
    response.steps.assembleReport.status = "completed";
    response.steps.assembleReport.validated = true;

    await emitProgress(onProgress, {
      step: "assembleReport",
      status: "completed",
      urgency: reportOutput.urgency,
    });
  } catch (error) {
    const message = `Call 2 failed or returned malformed output: ${formatError(error)}`;
    response.steps.assembleReport.status = "failed";
    response.steps.assembleReport.errors.push(message);
    skipStep(
      response.steps.qualityCheck,
      "Quality check skipped because report assembly failed."
    );
    await emitProgress(onProgress, {
      step: "assembleReport",
      status: "failed",
      error: message,
    });
    return completeResponse(response, "partial");
  }

  if (!pipeline.steps.includes("qualityCheck")) {
    skipStep(response.steps.qualityCheck, "Quality check is not enabled for this pipeline.");
    return completeResponse(response, "completed");
  }

  await emitProgress(onProgress, { step: "qualityCheck", status: "running" });

  try {
    const quality = runQualityCheck({ findingsOutput, reportOutput, pipeline });
    response.quality = quality;
    response.confidence.lowConfidenceFindingIds = quality.lowConfidenceFindingIds;
    response.steps.qualityCheck.status = "completed";
    response.steps.qualityCheck.validated = true;

    await emitProgress(onProgress, {
      step: "qualityCheck",
      status: "completed",
      warningCount: quality.warnings.length,
    });
  } catch (error) {
    const message = `Quality check failed: ${formatError(error)}`;
    response.steps.qualityCheck.status = "failed";
    response.steps.qualityCheck.errors.push(message);
    await emitProgress(onProgress, {
      step: "qualityCheck",
      status: "failed",
      error: message,
    });
    return completeResponse(response, "partial");
  }

  return completeResponse(response, "completed");
}

