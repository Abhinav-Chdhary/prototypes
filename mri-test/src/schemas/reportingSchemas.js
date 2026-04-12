import { z } from "zod";

export const StepStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
]);

export const PipelineStatusSchema = z.enum(["completed", "partial", "failed"]);

export const SeveritySchema = z.enum([
  "none",
  "low",
  "moderate",
  "high",
  "critical",
]);

export const UrgencyLevelSchema = z.enum([
  "routine",
  "priority",
  "urgent",
  "emergent",
]);

export const ReportRequestSchema = z
  .object({
    imagePath: z.string().trim().min(1).optional(),
    modality: z.string().trim().min(1).optional(),
    bodyPart: z.string().trim().min(1).optional(),
    clinicalContext: z.string().trim().min(1).optional(),
  })
  .strict();

export const FindingSchema = z
  .object({
    id: z
      .string()
      .describe("Stable finding id such as F1, F2, or F3."),
    location: z
      .string()
      .describe("Anatomic location, or 'global' when the finding is general."),
    description: z.string().describe("Plain-language finding description."),
    severity: SeveritySchema.describe(
      "Clinical/radiographic severity for the individual finding."
    ),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confidence score from 0 to 1."),
    evidence: z
      .string()
      .describe("Brief visual evidence or reason for the finding."),
  })
  .strict();

export const FindingsExtractionSchema = z
  .object({
    findings: z
      .array(FindingSchema)
      .describe("Structured list of findings detected in the image."),
    overallConfidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Overall confidence in the extracted findings."),
    imageQuality: z
      .object({
        diagnostic: z.boolean(),
        notes: z.string(),
        confidence: z.number().min(0).max(1),
      })
      .strict(),
    limitations: z.array(z.string()),
  })
  .strict();

export const ReportAssemblySchema = z
  .object({
    sections: z
      .object({
        clinicalContext: z.string(),
        technique: z.string(),
        comparison: z.string(),
        findings: z.string(),
        impression: z.string(),
        recommendations: z.string(),
      })
      .strict(),
    impression: z.array(z.string()),
    recommendations: z.array(z.string()),
    urgency: z
      .object({
        flag: z.boolean(),
        level: UrgencyLevelSchema,
        reason: z.string(),
      })
      .strict(),
    confidence: z
      .object({
        overall: z.number().min(0).max(1),
        rationale: z.string(),
      })
      .strict(),
    caveats: z.array(z.string()),
  })
  .strict();

export const QualityWarningSchema = z
  .object({
    type: z.string(),
    message: z.string(),
    findingId: z.string().nullable(),
    severity: SeveritySchema.nullable(),
  })
  .strict();

export const QualityCheckSchema = z
  .object({
    passed: z.boolean(),
    lowConfidenceFindingIds: z.array(z.string()),
    warnings: z.array(QualityWarningSchema),
  })
  .strict();

export const FeedbackPayloadSchema = z
  .object({
    reviewerId: z.string().trim().min(1).default("anonymous"),
    findingId: z.string().trim().min(1).nullable().optional(),
    section: z
      .enum(["clinicalContext", "technique", "comparison", "findings", "impression", "recommendations"])
      .nullable()
      .optional(),
    correction: z.string().trim().min(1),
    note: z.string().trim().nullable().optional(),
  })
  .strict();

