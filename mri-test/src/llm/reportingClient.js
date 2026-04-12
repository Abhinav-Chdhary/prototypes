import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import {
  FindingsExtractionSchema,
  ReportAssemblySchema,
} from "../schemas/reportingSchemas.js";
import { readImageAsDataUrl } from "./imageInput.js";

function createModel(modelName) {
  const apiKey = process.env.OPENAI_API_KEY;

  return new ChatOpenAI({
    model: modelName || process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
    apiKey,
    openAIApiKey: apiKey,
  });
}

function buildFindingsPrompt({ metadata, pipeline }) {
  return [
    "You are assisting a radiologist with a prototype draft report pipeline.",
    "Analyze the provided image and return only the structured findings requested by the schema.",
    "This is not a final diagnosis. Be conservative and explicitly reflect uncertainty.",
    "",
    `Modality: ${metadata.modality}`,
    `Body part: ${metadata.bodyPart}`,
    `Clinical context: ${metadata.clinicalContext}`,
    `Pipeline focus: ${pipeline.prompts.findingFocus}`,
    "",
    "Use finding ids F1, F2, F3, etc. If no acute abnormality is visible, include a normal or negative finding with severity 'none'.",
  ].join("\n");
}

function buildReportPrompt({ metadata, findingsOutput, pipeline }) {
  return [
    "Assemble a draft radiology report from the validated structured findings below.",
    "Use the findings exactly as validated input; do not invent unrelated abnormalities.",
    "Return only the structured report requested by the schema.",
    "",
    `Modality: ${metadata.modality}`,
    `Body part: ${metadata.bodyPart}`,
    `Clinical context: ${metadata.clinicalContext}`,
    `Report style: ${pipeline.prompts.reportStyle}`,
    "",
    "Validated findings JSON:",
    JSON.stringify(findingsOutput, null, 2),
  ].join("\n");
}

export function createOpenAIReportingClient({ modelName } = {}) {
  const model = createModel(modelName);

  return {
    async extractFindings({ imagePath, metadata, pipeline }) {
      const imageDataUrl = await readImageAsDataUrl(imagePath);
      const structuredModel = model.withStructuredOutput(
        FindingsExtractionSchema,
        { name: "extract_radiology_findings" }
      );

      return structuredModel.invoke([
        new SystemMessage(
          "You extract radiology findings into a strict schema for a downstream report assembly step."
        ),
        new HumanMessage({
          content: [
            { type: "text", text: buildFindingsPrompt({ metadata, pipeline }) },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        }),
      ]);
    },

    async assembleReport({ metadata, findingsOutput, pipeline }) {
      const structuredModel = model.withStructuredOutput(
        ReportAssemblySchema,
        { name: "assemble_radiology_report" }
      );

      return structuredModel.invoke([
        new SystemMessage(
          "You assemble a clinician-review draft report from already-validated structured findings."
        ),
        new HumanMessage(buildReportPrompt({ metadata, findingsOutput, pipeline })),
      ]);
    },
  };
}

