/**
 * Gurukul Centralized API Response & Safe Error Handling Engine
 * 
 * Guarantees:
 * - Uniform JSON structure across all API endpoints
 * - Request correlation IDs for end-to-end tracing and auditing
 * - Sensitive-data redaction in production (no leaked stack traces or DB specifics)
 * - Semantic HTTP status codes
 * - Automatic structured server-side logging
 */

import { NextResponse } from "next/server.js";
import crypto from "crypto";
import { logger } from "../monitoring/logger.js";

/**
 * Extracts or generates a correlation ID from incoming request headers.
 */
export function getCorrelationId(request) {
  if (!request) return crypto.randomUUID();
  return (
    request.headers?.get("x-correlation-id") ||
    request.headers?.get("x-request-id") ||
    crypto.randomUUID()
  );
}

/**
 * Returns a standardized successful API response.
 * 
 * @param {Object} data - Payload data
 * @param {number} [status=200] - HTTP status code
 * @param {Object} [meta={}] - Optional metadata (pagination, timings, etc.)
 * @param {Request} [request] - Incoming request for correlation tracing
 * @returns {NextResponse}
 */
export function apiSuccess(data = {}, status = 200, meta = {}, request = null) {
  const correlationId = getCorrelationId(request);

  const payload = {
    success: true,
    data,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
    correlationId,
  };

  return NextResponse.json(payload, {
    status,
    headers: {
      "X-Correlation-ID": correlationId,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Returns a standardized, sanitized error response.
 * 
 * @param {string|Error} error - Error object or string message
 * @param {number} [status=500] - HTTP status code
 * @param {string} [errorCode="API_ERROR"] - Machine-readable error identifier
 * @param {Request} [request] - Incoming request for correlation tracing
 * @param {Object} [details] - Optional sanitized details (e.g., validation errors)
 * @returns {NextResponse}
 */
export function apiError(
  error,
  status = 500,
  errorCode = "INTERNAL_ERROR",
  request = null,
  details = null
) {
  const correlationId = getCorrelationId(request);
  const isProd = process.env.NODE_ENV === "production";

  const errorMessage =
    typeof error === "string" ? error : error?.message || "An unexpected error occurred.";

  // Determine user-facing safe error message
  let safeMessage = errorMessage;
  if (status >= 500 && isProd) {
    safeMessage = "An internal server error occurred. Please contact support with the correlation ID.";
  }

  // Log error with correlation context
  const logPayload = {
    correlationId,
    status,
    errorCode,
    url: request?.url || "unknown",
    method: request?.method || "unknown",
    details,
  };

  if (status >= 500) {
    logger.error(`[API Error] ${errorCode}: ${errorMessage}`, {
      ...logPayload,
      stack: error?.stack,
    });
  } else {
    logger.warn(`[API Warning] ${errorCode}: ${errorMessage}`, logPayload);
  }

  const payload = {
    success: false,
    error: safeMessage,
    code: errorCode,
    correlationId,
    ...(details ? { details } : {}),
  };

  return NextResponse.json(payload, {
    status,
    headers: {
      "X-Correlation-ID": correlationId,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
