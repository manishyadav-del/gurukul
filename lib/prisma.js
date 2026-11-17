import { PrismaClient } from "@prisma/client";
import { logger } from "../server/monitoring/logger.js";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const isDev = process.env.NODE_ENV === "development";
  const shouldLogQueries = process.env.DEBUG_PRISMA === "true";

  const client = new PrismaClient({
    log: shouldLogQueries
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "error" },
          { emit: "stdout", level: "warn" },
        ]
      : [
          { emit: "stdout", level: "error" },
          { emit: "stdout", level: "warn" },
        ],
  });

  // Client extension for slow query detection (> 400ms) and telemetry
  const extendedClient = client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        try {
          const result = await query(args);
          const duration = Math.round(performance.now() - start);

          // Alert on slow database operations
          if (duration > 400) {
            logger.warn(
              `[Prisma Slow Query] ${model || "Raw"}.${operation} executed in ${duration}ms`,
              {
                model,
                operation,
                durationMs: duration,
              }
            );
          }
          return result;
        } catch (error) {
          logger.alertDatabaseFailure(error, { model, operation });
          throw error;
        }
      },
    },
  });

  // Graceful shutdown handling
  const cleanDisconnect = async () => {
    try {
      await client.$disconnect();
    } catch {
      // Ignore disconnect error on termination
    }
  };

  process.once("beforeExit", cleanDisconnect);

  return extendedClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
