import express from "express";
import { runReportingPipeline } from "../pipeline/runReportingPipeline.js";
import { ReportRequestSchema } from "../schemas/reportingSchemas.js";
import {
  appendJobEvent,
  createJob,
  getJob,
  subscribeToJob,
  updateJob,
} from "../storage/jobStore.js";

function writeSse(res, eventName, data) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function createJobRouter(options = {}) {
  const router = express.Router();

  router.post("/", (req, res) => {
    const parsed = ReportRequestSchema.safeParse(req.body || {});

    if (!parsed.success) {
      res.status(400).json({
        status: "failed",
        error: "Invalid report job request payload.",
        details: parsed.error.issues,
      });
      return;
    }

    const job = createJob(parsed.data);

    setImmediate(async () => {
      updateJob(job.id, { status: "running" });
      appendJobEvent(job.id, {
        type: "started",
        message: "Report pipeline started.",
      });

      try {
        const result = await runReportingPipeline(parsed.data, {
          ...options.pipelineDeps,
          onProgress: (progress) => {
            appendJobEvent(job.id, {
              type: "progress",
              progress,
            });
          },
        });

        updateJob(job.id, {
          status: result.status === "completed" ? "completed" : "partial",
          result,
        });
        appendJobEvent(job.id, {
          type: "finished",
          status: result.status,
          reportId: result.reportId,
        });
      } catch (error) {
        updateJob(job.id, {
          status: "failed",
          error: error.message || String(error),
        });
        appendJobEvent(job.id, {
          type: "failed",
          error: error.message || String(error),
        });
      }
    });

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      statusUrl: `/api/reports/jobs/${job.id}`,
      eventsUrl: `/api/reports/jobs/${job.id}/events`,
    });
  });

  router.get("/:jobId", (req, res) => {
    const job = getJob(req.params.jobId);

    if (!job) {
      res.status(404).json({ status: "failed", error: "Job not found." });
      return;
    }

    res.json(job);
  });

  router.get("/:jobId/events", (req, res) => {
    const job = getJob(req.params.jobId);

    if (!job) {
      res.status(404).json({ status: "failed", error: "Job not found." });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    for (const event of job.events) {
      writeSse(res, event.type, event);
    }

    const unsubscribe = subscribeToJob(req.params.jobId, (event) => {
      writeSse(res, event.type, event);
    });

    req.on("close", unsubscribe);
  });

  return router;
}

