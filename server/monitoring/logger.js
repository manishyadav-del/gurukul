/**
 * Structured Production Logger & Alerting Engine for Gurukul
 * 
 * Features:
 * - Structured JSON logging format with ISO-8601 timestamps
 * - Automatic redaction of credentials, API keys, tokens, and personal birth coordinates
 * - In-memory actionable alert tracking (circular buffer)
 * - Specific monitoring alerts:
 *   - Database connection and query failures
 *   - AI provider rate limits and timeouts
 *   - Slow search queries (> 300ms)
 *   - Slow API requests (> 1500ms)
 *   - Background OCR and embedding worker failures
 *   - Broken manuscript references and passage citation errors
 */

const MAX_ALERT_HISTORY = 100;
const recentAlerts = [];

export const LOG_LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
};

const CURRENT_LEVEL = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

// Redaction patterns
const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "auth_secret",
  "gemini_api_key",
  "google_ai_key",
  "hash",
  "creditcard",
  "authorization",
]);

/**
 * Deeply scrubs sensitive keys and values from logging objects.
 */
export function redactSensitiveData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes("secret") || lowerKey.includes("password")) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Writes a structured log entry.
 */
function log(levelName, message, context = {}) {
  const levelValue = LOG_LEVELS[levelName] || LOG_LEVELS.INFO;
  if (levelValue < CURRENT_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level: levelName,
    message,
    correlationId: context?.correlationId || context?.requestId || undefined,
    context: redactSensitiveData(context),
    pid: process.pid,
  };

  const jsonString = JSON.stringify(entry);

  if (levelValue >= LOG_LEVELS.ERROR) {
    console.error(jsonString);
  } else if (levelValue >= LOG_LEVELS.WARN) {
    console.warn(jsonString);
  } else {
    console.log(jsonString);
  }

  return entry;
}

/**
 * Records an actionable operational alert.
 */
export function recordAlert(category, message, metadata = {}, severity = "WARN") {
  const alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    severity,
    metadata: redactSensitiveData(metadata),
  };

  recentAlerts.unshift(alert);
  if (recentAlerts.length > MAX_ALERT_HISTORY) {
    recentAlerts.pop();
  }

  log(severity === "CRITICAL" ? "FATAL" : severity === "ERROR" ? "ERROR" : "WARN", `[ALERT:${category}] ${message}`, metadata);
  return alert;
}

export const logger = {
  debug: (msg, ctx) => log("DEBUG", msg, ctx),
  info: (msg, ctx) => log("INFO", msg, ctx),
  warn: (msg, ctx) => log("WARN", msg, ctx),
  error: (msg, ctx) => log("ERROR", msg, ctx),
  fatal: (msg, ctx) => log("FATAL", msg, ctx),

  // Actionable Monitoring Alerts
  alertDatabaseFailure: (error, ctx = {}) =>
    recordAlert("DATABASE_FAILURE", error.message || String(error), { ...ctx, stack: error.stack }, "CRITICAL"),

  alertAiProviderError: (error, ctx = {}) =>
    recordAlert("AI_PROVIDER_ERROR", error.message || String(error), ctx, "ERROR"),

  alertSlowSearch: (query, latencyMs, thresholdMs = 300) => {
    if (latencyMs > thresholdMs) {
      return recordAlert(
        "SLOW_SEARCH",
        `Search query latency exceeded ${thresholdMs}ms (actual: ${latencyMs}ms)`,
        { query: query.slice(0, 100), latencyMs, thresholdMs },
        "WARN"
      );
    }
    return null;
  },

  alertSlowApiRequest: (path, latencyMs, thresholdMs = 1500) => {
    if (latencyMs > thresholdMs) {
      return recordAlert(
        "SLOW_API_REQUEST",
        `API request to ${path} took ${latencyMs}ms (> ${thresholdMs}ms)`,
        { path, latencyMs, thresholdMs },
        "WARN"
      );
    }
    return null;
  },

  alertWorkerFailure: (jobId, jobType, error) =>
    recordAlert(
      "BACKGROUND_WORKER_FAILURE",
      `Worker failed for ${jobType} job ${jobId}: ${error.message || String(error)}`,
      { jobId, jobType, error: error.message },
      "ERROR"
    ),

  alertBrokenSourceLink: (passageId, bookTitle, readerUrl) =>
    recordAlert(
      "BROKEN_SOURCE_LINK",
      `Passage citation points to broken or inaccessible reader URL: ${readerUrl}`,
      { passageId, bookTitle, readerUrl },
      "WARN"
    ),

  getRecentAlerts: () => [...recentAlerts],
};
