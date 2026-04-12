import express from "express";
import { randomUUID } from "node:crypto";
import { FeedbackPayloadSchema } from "../schemas/reportingSchemas.js";
import { saveFeedback } from "../storage/feedbackStore.js";

export function createFeedbackRouter() {
  const router = express.Router();

  router.post("/reports/:reportId/feedback", async (req, res, next) => {
    const parsed = FeedbackPayloadSchema.safeParse(req.body || {});

    if (!parsed.success) {
      res.status(400).json({
        status: "failed",
        error: "Invalid feedback payload.",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const entry = await saveFeedback({
        id: randomUUID(),
        reportId: req.params.reportId,
        createdAt: new Date().toISOString(),
        ...parsed.data,
      });

      res.status(201).json({
        status: "stored",
        feedback: entry,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

