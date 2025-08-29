import fs from "fs/promises";
import path from "path";
import { getGlobals } from "../globals";

export interface IntegrationLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  category: "deploy" | "trigger" | "integration" | "other";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface LogQueryOptions {
  category?: IntegrationLog["category"];
  level?: IntegrationLog["level"];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

class IntegrationLogsStorage {
  private getLogsDir(integrationId: string): string {
    const { internalDataFilePath } = getGlobals();
    return path.join(internalDataFilePath, "integration-logs", integrationId);
  }

  private getLogFilePath(integrationId: string): string {
    return path.join(this.getLogsDir(integrationId), "logs.json");
  }

  async ensureLogsDir(integrationId: string): Promise<void> {
    const logsDir = this.getLogsDir(integrationId);
    try {
      await fs.access(logsDir);
    } catch {
      await fs.mkdir(logsDir, { recursive: true });
    }
  }

  async addLog(
    integrationId: string,
    log: Omit<IntegrationLog, "id" | "timestamp">,
  ): Promise<void> {
    await this.ensureLogsDir(integrationId);

    const logFilePath = this.getLogFilePath(integrationId);
    const fullLog: IntegrationLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    let logs: IntegrationLog[] = [];
    try {
      const existingData = await fs.readFile(logFilePath, "utf-8");
      logs = JSON.parse(existingData);
    } catch {
      // File doesn't exist or is invalid, start with empty array
    }

    logs.push(fullLog);

    // Keep only the last 1000 logs to prevent file from growing too large
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2));
  }

  async getLogs(
    integrationId: string,
    options: LogQueryOptions = {},
  ): Promise<IntegrationLog[]> {
    const logFilePath = this.getLogFilePath(integrationId);

    try {
      const data = await fs.readFile(logFilePath, "utf-8");
      let logs: IntegrationLog[] = JSON.parse(data);

      // Apply filters
      if (options.category) {
        logs = logs.filter((log) => log.category === options.category);
      }

      if (options.level) {
        logs = logs.filter((log) => log.level === options.level);
      }

      if (options.startDate) {
        logs = logs.filter((log) => log.timestamp >= options.startDate!);
      }

      if (options.endDate) {
        logs = logs.filter((log) => log.timestamp <= options.endDate!);
      }

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 100;

      return logs.slice(offset, offset + limit).reverse(); // Return newest first
    } catch {
      return [];
    }
  }

  async deleteLogs(integrationId: string): Promise<void> {
    const logFilePath = this.getLogFilePath(integrationId);
    try {
      await fs.unlink(logFilePath);
    } catch {
      // File doesn't exist, which is fine
    }
  }

  async getLogStats(integrationId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  }> {
    const logs = await this.getLogs(integrationId, { limit: 10000 }); // Get all logs for stats

    const byCategory: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    logs.forEach((log) => {
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
    });

    return {
      total: logs.length,
      byCategory,
      byLevel,
    };
  }
}

export const integrationLogsStorage = new IntegrationLogsStorage();
