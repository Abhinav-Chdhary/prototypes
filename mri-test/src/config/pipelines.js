const modalityAliases = {
  "x-ray": "XRAY",
  xray: "XRAY",
  radiograph: "XRAY",
  xr: "XRAY",
};

export const pipelines = {
  XRAY_CHEST: {
    id: "xray-chest-v1",
    label: "Chest X-ray reporting pipeline",
    modality: "X-ray",
    normalizedModality: "XRAY",
    bodyParts: ["chest", "thorax"],
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    steps: ["extractFindings", "assembleReport", "qualityCheck"],
    thresholds: {
      lowConfidence: 0.55,
      urgentSeverities: ["high", "critical"],
    },
    prompts: {
      findingFocus:
        "Evaluate the chest radiograph for lungs, pleura, mediastinum, heart size, visible osseous structures, tubes or devices, and image limitations.",
      reportStyle:
        "Write a concise draft radiology report for clinician review. Do not claim certainty beyond the supplied findings.",
    },
  },
};

export function normalizeModality(modality = "") {
  const key = modality.trim().toLowerCase();
  return modalityAliases[key] || key.toUpperCase();
}

export function normalizeBodyPart(bodyPart = "") {
  return bodyPart.trim().toLowerCase();
}

export function getPipelineConfig({ modality, bodyPart }) {
  const normalizedModality = normalizeModality(modality);
  const normalizedBodyPart = normalizeBodyPart(bodyPart);

  return Object.values(pipelines).find((pipeline) => {
    return (
      pipeline.normalizedModality === normalizedModality &&
      pipeline.bodyParts.includes(normalizedBodyPart)
    );
  });
}

