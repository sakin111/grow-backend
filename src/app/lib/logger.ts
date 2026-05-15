import pino from "pino";
import { envVar } from "../config/envVar";

/**
 * Structured logger powered by pino.
 *
 * - Outputs JSON in production for log aggregation (ELK, Datadog, etc.)
 * - Uses pino-pretty in development for human-readable output.
 * - Log level is driven by LOG_LEVEL env var (defaults to "info").
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(envVar.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});
