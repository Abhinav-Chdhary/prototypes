import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const PROJECT_ROOT = path.resolve(dirname, "../..");

export const DEFAULT_IMAGE_PATH = path.join(
  PROJECT_ROOT,
  "Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg"
);

export const DEFAULT_REPORT_INPUT = {
  imagePath: DEFAULT_IMAGE_PATH,
  modality: "X-ray",
  bodyPart: "chest",
  clinicalContext:
    "Adult patient with cough and mild shortness of breath. Evaluate for acute cardiopulmonary abnormality.",
};

export const DEFAULT_PORT = 4000;

