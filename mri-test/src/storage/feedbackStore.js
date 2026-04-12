import fs from "node:fs/promises";
import path from "node:path";
import { PROJECT_ROOT } from "../config/defaults.js";

const feedbackPath = path.join(PROJECT_ROOT, "data", "feedback.jsonl");

export async function saveFeedback(entry) {
  await fs.mkdir(path.dirname(feedbackPath), { recursive: true });
  await fs.appendFile(feedbackPath, `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}

