import { z } from "zod";

export const bookStatusEnum = z.enum([
  "DRAFT",
  "RECEIVED",
  "PROCESSING",
  "NEEDS_REVIEW",
  "PROOFREAD",
  "PENDING_APPROVAL",
  "APPROVED",
  "EXPERT_APPROVED",
  "PUBLISHED",
  "REJECTED",
  "FAILED",
  "ARCHIVED",
  "UNPUBLISHED",
]);

export const processingStatusEnum = z.enum([
  "QUEUED",
  "ANALYZING",
  "EXTRACTING",
  "OCR_PROCESSING",
  "CLEANING",
  "STRUCTURING",
  "IMPORTING",
  "COMPLETED",
  "FAILED",
]);

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  author: z.string().max(255).optional().nullable(),
  publisher: z.string().max(255).optional().nullable(),
  edition: z.string().max(100).optional().nullable(),
  isbn: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  language: z.string().default("Hindi"),
  script: z.string().default("Devanagari").optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  originalFileName: z.string().optional().nullable(),
  originalFileUrl: z.string().optional().nullable(),
  sourcePdf: z.string().optional().nullable(),
  pageCount: z.number().int().nonnegative().optional().nullable(),
  status: bookStatusEnum.default("RECEIVED"),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  author: z.string().max(255).optional().nullable(),
  publisher: z.string().max(255).optional().nullable(),
  edition: z.string().max(100).optional().nullable(),
  isbn: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  language: z.string().optional(),
  script: z.string().optional().nullable(),
  processingStatus: processingStatusEnum.optional(),
  coverImageUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
});

export const updatePageSchema = z.object({
  proofreadText: z.string().optional(),
  proofread: z.boolean().optional(),
  flagError: z
    .object({
      errorType: z.enum([
        "LOW_CONFIDENCE",
        "EMPTY_PAGE",
        "OCR_FAILED",
        "IMAGE_RENDER_FAILED",
        "TEXT_EXTRACTION_FAILED",
        "LANGUAGE_DETECTION_FAILED",
      ]),
      message: z.string().min(1),
    })
    .optional(),
});

export const searchSchema = z.object({
  q: z.string().max(200).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  language: z.string().optional(),
  bookId: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  passageType: z.string().optional(),
  mode: z.enum(["hybrid", "semantic", "lexical"]).default("hybrid").optional(),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional().nullable(),
  bookId: z.string().uuid().optional().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  isPublished: z.boolean().default(false),
  questions: z
    .array(
      z.object({
        question: z.string().min(1, "Question text is required"),
        explanation: z.string().optional().nullable(),
        options: z
          .array(
            z.object({
              text: z.string().min(1, "Option text is required"),
              isCorrect: z.boolean().default(false),
            })
          )
          .min(2, "At least two options are required"),
      })
    )
    .optional(),
});

export const birthProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  birthDate: z.coerce.date(),
  birthTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Valid HH:MM or HH:MM:SS format required")
    .optional()
    .nullable(),
  birthPlace: z.string().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
});
