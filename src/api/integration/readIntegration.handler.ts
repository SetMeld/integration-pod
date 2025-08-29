import { RequestHandler } from "express";
import { HttpError } from "../HttpError";
import { IntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import { readIntegrationMeta } from "../../integrationStorage/integrationMeta.storage";

/**
 * Reads a single integration by ID from storage
 * @param req - Express request object
 * @param res - Express response object
 */
export const readIntegrationHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new HttpError(
        400,
        "Integration ID is required and must be a non-empty string",
      );
    }

    const integrationId = id.trim();

    // Read the integration meta data
    const integrationMeta = await readIntegrationMeta(integrationId);

    console.log(
      `[${integrationId}] Retrieved integration: ${integrationMeta.name}`,
    );

    // Return the integration
    res.json(integrationMeta);
  } catch (error) {
    console.error("Failed to read integration:", error);

    if (error instanceof HttpError) {
      throw error;
    }

    // Check if it's a file not found error
    if (
      error instanceof Error &&
      error.message.includes("Failed to read integration meta")
    ) {
      throw new HttpError(404, "Integration not found");
    }

    throw new HttpError(500, "Failed to read integration");
  }
};
