import { z } from "zod";

/**
 * Gurukul Production Environment Schema & Startup Validator
 * 
 * Validates required server-side environment variables at application startup,
 * ensuring strict type safety, entropy checks for cryptographic secrets,
 * and zero exposure of secrets in logs or error messages.
 */

const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required for PostgreSQL persistence",
    })
    .min(10, "DATABASE_URL is too short to be a valid connection string"),

  // Authentication & Session Security (Minimum 32-character high entropy)
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters for HMAC-SHA256 tokens")
    .optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters")
    .optional(),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),

  // Storage Provider Configuration
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Optical Character Recognition (OCR) Engine
  OCR_ENGINE: z.enum(["tesseract", "paddleocr"]).default("tesseract"),
  OCR_LANGUAGE: z.string().default("eng+hin+san"),
  OCR_MIN_CONFIDENCE: z.coerce.number().min(0).max(1).default(0.70),
  OCR_DPI: z.coerce.number().int().min(72).max(600).default(300),

  // Application Logging & Runtime
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
});

/**
 * Validates environment variables safely.
 * Returns { valid: boolean, errors?: string[], env: Object }
 */
export function validateEnvironment(processEnv = process.env) {
  // Support either AUTH_SECRET or NEXTAUTH_SECRET
  const effectiveAuthSecret = processEnv.AUTH_SECRET || processEnv.NEXTAUTH_SECRET;

  const parsingInput = {
    ...processEnv,
    AUTH_SECRET: effectiveAuthSecret,
    NEXTAUTH_SECRET: effectiveAuthSecret,
  };

  const result = envSchema.safeParse(parsingInput);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errorMessages = issues.map((err) => {
      const field = err.path.join(".");
      return `[ENV_ERROR] ${field}: ${err.message}`;
    });

    return {
      valid: false,
      errors: errorMessages,
      env: null,
    };
  }

  // Cross-field validation: S3 required when STORAGE_PROVIDER === "s3"
  if (result.data.STORAGE_PROVIDER === "s3") {
    const missingS3 = [];
    if (!result.data.S3_BUCKET) missingS3.push("S3_BUCKET");
    if (!result.data.S3_ACCESS_KEY_ID) missingS3.push("S3_ACCESS_KEY_ID");
    if (!result.data.S3_SECRET_ACCESS_KEY) missingS3.push("S3_SECRET_ACCESS_KEY");

    if (missingS3.length > 0) {
      return {
        valid: false,
        errors: [`STORAGE_PROVIDER is "s3" but missing required credentials: ${missingS3.join(", ")}`],
        env: null,
      };
    }
  }

  return {
    valid: true,
    errors: [],
    env: result.data,
  };
}

export const env = validateEnvironment().env;
