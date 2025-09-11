import { RequestHandler } from "express";
import {
  integrationLogsStorage,
  type IntegrationLog,
} from "../../integrationStorage/integrationLogs.storage";
import { getGlobals } from "../../globals";

export const readIntegrationLogsHandler: RequestHandler = async (req, res) => {
  try {
    const { id: integrationId } = req.params;
    const { logger } = getGlobals();

    // Parse query parameters
    const category = req.query.category as string | undefined;
    const level = req.query.level as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 100;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : 0;

    // Validate parameters
    if (limit > 1000) {
      throw new Error("Limit cannot exceed 1000");
    }

    if (limit < 1) {
      throw new Error("Limit must be at least 1");
    }

    if (offset < 0) {
      throw new Error("Offset must be non-negative");
    }

    // Validate category if provided
    if (
      category &&
      !["deploy", "trigger", "integration", "other"].includes(category)
    ) {
      throw new Error(
        "Invalid category. Must be one of: deploy, trigger, integration, other",
      );
    }

    // Validate level if provided
    if (level && !["info", "warn", "error", "debug"].includes(level)) {
      throw new Error(
        "Invalid level. Must be one of: info, warn, error, debug",
      );
    }

    // Get logs
    const logs = await integrationLogsStorage.getLogs(integrationId, {
      category: category as IntegrationLog["category"],
      level: level as IntegrationLog["level"],
      startDate,
      endDate,
      limit,
      offset,
    });

    // Get stats for the response
    const stats = await integrationLogsStorage.getLogStats(integrationId);

    logger.info(
      `Retrieved ${logs.length} logs for integration ${integrationId}`,
      {
        integrationId,
        category,
        level,
        startDate,
        endDate,
        limit,
        offset,
        totalLogs: stats.total,
      },
    );

    res.json({
      logs,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total,
      },
    });
  } catch (error) {
    const { logger } = getGlobals();
    logger.error("Failed to read integration logs", {
      error: error instanceof Error ? error.message : String(error),
      integrationId: req.params.id,
    });

    res.status(500).json({
      error: "Failed to read integration logs",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
