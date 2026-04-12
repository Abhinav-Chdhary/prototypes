import cors from "cors";
import express from "express";
import { createFeedbackRouter } from "./routes/feedbackRoutes.js";
import { createJobRouter } from "./routes/jobRoutes.js";
import { createReportRouter } from "./routes/reportRoutes.js";

export function createApp(options = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/reports/jobs", createJobRouter(options));
  app.use("/api", createFeedbackRouter(options));
  app.use("/api", createReportRouter(options));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
      status: "failed",
      error: err.message || "Unexpected server error.",
    });
  });

  return app;
}

