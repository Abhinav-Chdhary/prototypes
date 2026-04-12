import { QualityCheckSchema } from "../../schemas/reportingSchemas.js";

const severityRank = {
  none: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export function runQualityCheck({ findingsOutput, reportOutput, pipeline }) {
  const lowConfidenceThreshold = pipeline.thresholds.lowConfidence;
  const urgentSeverities = new Set(pipeline.thresholds.urgentSeverities);
  const warnings = [];

  const lowConfidenceFindingIds = findingsOutput.findings
    .filter((finding) => finding.confidence < lowConfidenceThreshold)
    .map((finding) => {
      warnings.push({
        type: "LOW_CONFIDENCE_FINDING",
        message: `Finding ${finding.id} has confidence ${finding.confidence}.`,
        findingId: finding.id,
        severity: finding.severity,
      });

      return finding.id;
    });

  const mostSevereFinding = findingsOutput.findings.reduce((current, finding) => {
    if (!current) return finding;
    return severityRank[finding.severity] > severityRank[current.severity]
      ? finding
      : current;
  }, null);

  if (
    mostSevereFinding &&
    urgentSeverities.has(mostSevereFinding.severity) &&
    !reportOutput.urgency.flag
  ) {
    warnings.push({
      type: "URGENCY_MISMATCH",
      message: `Most severe finding is ${mostSevereFinding.severity}, but the report urgency flag is false.`,
      findingId: mostSevereFinding.id,
      severity: mostSevereFinding.severity,
    });
  }

  if (
    reportOutput.urgency.level === "emergent" &&
    (!mostSevereFinding || severityRank[mostSevereFinding.severity] < severityRank.high)
  ) {
    warnings.push({
      type: "POSSIBLE_OVERTRIAGE",
      message: "Report urgency is emergent, but no high or critical finding was extracted.",
      findingId: mostSevereFinding?.id || null,
      severity: mostSevereFinding?.severity || null,
    });
  }

  return QualityCheckSchema.parse({
    passed: warnings.length === 0,
    lowConfidenceFindingIds,
    warnings,
  });
}

