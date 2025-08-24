import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs/promises";

// Ensure the base logs directory exists
const BASE_LOGS_DIR = "/app/integrations-meta";
const GENERAL_LOGS_DIR = "/app/general-logs";

// Create a logger factory that creates loggers for specific integrations
export function createIntegrationLogger(integrationName: string) {
  const integrationLogsDir = path.join(BASE_LOGS_DIR, integrationName, "logs");

  // Ensure the integration logs directory exists
  fs.mkdir(integrationLogsDir, { recursive: true }).catch((error) => {
    generalLogger.error("Failed to create integration logs directory", {
      integrationName,
      path: integrationLogsDir,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, integration, ...meta }) => {
        const metaStr = Object.keys(meta).length
          ? JSON.stringify(meta, null, 2)
          : "";
        return `${timestamp} [${integration || "SYSTEM"}] ${level}: ${message} ${metaStr}`;
      },
    ),
  );

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    defaultMeta: { integration: integrationName },
    transports: [
      // Console transport for development/debugging
      new winston.transports.Console({
        format: consoleFormat,
        level: process.env.LOG_LEVEL || "info",
      }),

      // Daily rotating file transport for integration logs
      new DailyRotateFile({
        filename: path.join(integrationLogsDir, "integration-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        level: "debug",
      }),

      // Error log file
      new DailyRotateFile({
        filename: path.join(integrationLogsDir, "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
      }),
    ],
  });

  return logger;
}

// Create a general logger for application-wide logging
export const generalLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { category: "GENERAL" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          return `${timestamp} [GENERAL] ${level}: ${message} ${metaStr}`;
        }),
      ),
      level: process.env.LOG_LEVEL || "info",
    }),

    new DailyRotateFile({
      filename: path.join(GENERAL_LOGS_DIR, "general-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "debug",
    }),

    new DailyRotateFile({
      filename: path.join(GENERAL_LOGS_DIR, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error",
    }),
  ],
});

// Create a system logger for general application logs
export const systemLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { integration: "SYSTEM" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          return `${timestamp} [SYSTEM] ${level}: ${message} ${metaStr}`;
        }),
      ),
      level: process.env.LOG_LEVEL || "info",
    }),

    new DailyRotateFile({
      filename: path.join(BASE_LOGS_DIR, "system-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "debug",
    }),
  ],
});

// Utility function to capture command output
export async function logCommandOutput(
  integrationName: string,
  command: string,
  stdout: string,
  stderr: string,
  exitCode: number,
) {
  const logger = createIntegrationLogger(integrationName);

  logger.info("Command executed", {
    command,
    exitCode,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  });

  if (exitCode !== 0) {
    logger.error("Command failed", {
      command,
      exitCode,
      stderr: stderr.trim(),
    });
  }
}

// Utility function to capture integration run logs
export function logIntegrationRun(
  integrationName: string,
  data: unknown,
  result?: unknown,
  error?: Error,
) {
  const logger = createIntegrationLogger(integrationName);

  logger.info("Integration run started", {
    data: JSON.stringify(data, null, 2),
  });

  if (error) {
    logger.error("Integration run failed", {
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.info("Integration run completed successfully", {
      result: JSON.stringify(result, null, 2),
    });
  }
}

// Export a default logger for backward compatibility
export const logger = generalLogger;
