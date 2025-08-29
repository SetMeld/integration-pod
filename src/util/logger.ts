import { getLoggerFor } from "global-logger-factory";
import { integrationLogsStorage } from "../integrationStorage/integrationLogs.storage";
import type { IntegrationLog } from "../integrationStorage/integrationLogs.storage";

export class Logger {
  private winstonLogger = getLoggerFor(this);

  // General logging methods (using winston)
  info(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.error(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      this.winstonLogger.debug(`${message} ${JSON.stringify(meta)}`);
    } else {
      this.winstonLogger.debug(message);
    }
  }

  // Integration-specific logging methods
  async logIntegration(
    integrationId: string,
    level: IntegrationLog["level"],
    category: IntegrationLog["category"],
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await integrationLogsStorage.addLog(integrationId, {
        level,
        category,
        message,
        metadata,
      });
    } catch (error) {
      // Fallback to general logging if integration logging fails
      this.error(
        `Failed to log integration message for ${integrationId}: ${message}`,
        {
          error,
          integrationId,
          category,
        },
      );
    }
  }

  // Convenience methods for integration logging
  async logIntegrationInfo(
    integrationId: string,
    category: IntegrationLog["category"],
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegration(
      integrationId,
      "info",
      category,
      message,
      metadata,
    );
  }

  async logIntegrationWarn(
    integrationId: string,
    category: IntegrationLog["category"],
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegration(
      integrationId,
      "warn",
      category,
      message,
      metadata,
    );
  }

  async logIntegrationError(
    integrationId: string,
    category: IntegrationLog["category"],
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegration(
      integrationId,
      "error",
      category,
      message,
      metadata,
    );
  }

  async logIntegrationDebug(
    integrationId: string,
    category: IntegrationLog["category"],
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegration(
      integrationId,
      "debug",
      category,
      message,
      metadata,
    );
  }

  // Deploy-specific convenience methods
  async logDeployInfo(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationInfo(integrationId, "deploy", message, metadata);
  }

  async logDeployWarn(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationWarn(integrationId, "deploy", message, metadata);
  }

  async logDeployError(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationError(integrationId, "deploy", message, metadata);
  }

  // Trigger-specific convenience methods
  async logTriggerInfo(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationInfo(integrationId, "trigger", message, metadata);
  }

  async logTriggerWarn(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationWarn(integrationId, "trigger", message, metadata);
  }

  async logTriggerError(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationError(integrationId, "trigger", message, metadata);
  }

  // Integration execution-specific convenience methods
  async logIntegrationExecInfo(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationInfo(
      integrationId,
      "integration",
      message,
      metadata,
    );
  }

  async logIntegrationExecWarn(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationWarn(
      integrationId,
      "integration",
      message,
      metadata,
    );
  }

  async logIntegrationExecError(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationError(
      integrationId,
      "integration",
      message,
      metadata,
    );
  }

  // Other integration-specific convenience methods
  async logIntegrationOtherInfo(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationInfo(integrationId, "other", message, metadata);
  }

  async logIntegrationOtherWarn(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationWarn(integrationId, "other", message, metadata);
  }

  async logIntegrationOtherError(
    integrationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logIntegrationError(integrationId, "other", message, metadata);
  }
}

// Create a singleton instance
export const logger = new Logger();
