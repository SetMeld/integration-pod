import fs from "fs/promises";
import path from "path";
import { systemLogger, generalLogger } from "./logger";

const BASE_LOGS_DIR = "/app/integrations-meta";
const GENERAL_LOGS_DIR = "/app/general-logs";

export async function initializeLogging(): Promise<void> {
  try {
    // Ensure the base logs directory exists
    await fs.mkdir(BASE_LOGS_DIR, { recursive: true });

    // Ensure the general logs directory exists
    await fs.mkdir(GENERAL_LOGS_DIR, { recursive: true });

    systemLogger.info("Logging system initialized", {
      baseLogsDir: BASE_LOGS_DIR,
      generalLogsDir: GENERAL_LOGS_DIR,
      logLevel: process.env.LOG_LEVEL || "info",
    });
  } catch (error) {
    generalLogger.error("Failed to initialize logging system", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw here as we want the application to continue even if logging fails
  }
}

export function getLogsDirectory(): string {
  return BASE_LOGS_DIR;
}

export function getGeneralLogsDirectory(): string {
  return GENERAL_LOGS_DIR;
}

export function getIntegrationLogsPath(integrationName: string): string {
  return path.join(BASE_LOGS_DIR, integrationName, "logs");
}
