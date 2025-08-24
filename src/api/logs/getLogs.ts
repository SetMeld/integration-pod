import { RequestHandler } from "express";
import fs from "fs/promises";
import path from "path";
import { getIntegrationLogsPath } from "../../utils/initLogging";
import { generalLogger } from "../../utils/logger";

export const getLogsHandler: RequestHandler = async (req, res) => {
  try {
    const { integrationName } = req.params;
    const { type = "integration", date } = req.query;

    if (!integrationName) {
      res.status(400).json({ error: "Integration name is required" });
      return;
    }

    const logsDir = getIntegrationLogsPath(integrationName);

    // Check if the logs directory exists
    try {
      await fs.access(logsDir);
    } catch {
      res.status(404).json({ error: "No logs found for this integration" });
      return;
    }

    let logFile: string;

    if (date) {
      // Get logs for a specific date
      logFile = path.join(logsDir, `${type}-${date}.log`);
    } else {
      // Get the most recent log file
      const files = await fs.readdir(logsDir);
      const logFiles = files
        .filter((file) => file.startsWith(`${type}-`) && file.endsWith(".log"))
        .sort()
        .reverse();

      if (logFiles.length === 0) {
        res.status(404).json({ error: "No log files found" });
        return;
      }

      logFile = path.join(logsDir, logFiles[0]);
    }

    // Check if the log file exists
    try {
      await fs.access(logFile);
    } catch {
      res.status(404).json({ error: "Log file not found" });
      return;
    }

    // Read the log file
    const logContent = await fs.readFile(logFile, "utf-8");

    res.json({
      integrationName,
      logType: type,
      date: date || "latest",
      content: logContent,
      filePath: logFile,
    });
  } catch (error) {
    generalLogger.error("Error retrieving logs", {
      error: error instanceof Error ? error.message : String(error),
      integrationName: req.params.integrationName,
      logType: req.query.type,
      date: req.query.date,
    });
    res.status(500).json({ error: "Failed to retrieve logs" });
  }
};

export const getLogsListHandler: RequestHandler = async (req, res) => {
  try {
    const { integrationName } = req.params;

    if (!integrationName) {
      res.status(400).json({ error: "Integration name is required" });
      return;
    }

    const logsDir = getIntegrationLogsPath(integrationName);

    // Check if the logs directory exists
    try {
      await fs.access(logsDir);
    } catch {
      res.status(404).json({ error: "No logs found for this integration" });
      return;
    }

    const files = await fs.readdir(logsDir);
    const logFiles = files
      .filter((file) => file.endsWith(".log"))
      .map((file) => {
        const match = file.match(/^(.+)-(\d{4}-\d{2}-\d{2})\.log$/);
        return {
          name: file,
          type: match ? match[1] : "unknown",
          date: match ? match[2] : "unknown",
          size: 0, // We'll get this in a separate call if needed
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      integrationName,
      logFiles,
    });
  } catch (error) {
    generalLogger.error("Error retrieving logs list", {
      error: error instanceof Error ? error.message : String(error),
      integrationName: req.params.integrationName,
    });
    res.status(500).json({ error: "Failed to retrieve logs list" });
  }
};
