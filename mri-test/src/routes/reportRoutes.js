import express from "express";
import { DEFAULT_REPORT_INPUT } from "../config/defaults.js";
import { runReportingPipeline } from "../pipeline/runReportingPipeline.js";
import { ReportRequestSchema } from "../schemas/reportingSchemas.js";

export function createReportRouter(options = {}) {
  const router = express.Router();

  router.get("/reports/sample-input", (_req, res) => {
    res.json(DEFAULT_REPORT_INPUT);
  });

  router.post("/reports", async (req, res, next) => {
    const parsed = ReportRequestSchema.safeParse(req.body || {});

    if (!parsed.success) {
      res.status(400).json({
        status: "failed",
        error: "Invalid report request payload.",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const result = await runReportingPipeline(parsed.data, options.pipelineDeps);
      res.status(result.status === "failed" ? 422 : 200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

