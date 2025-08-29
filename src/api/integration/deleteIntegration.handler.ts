import { RequestHandler } from "express";
import { HttpError } from "../HttpError";
import { deleteIntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import { deleteIntegrationGitRepo } from "../../integrationStorage/integrationGit.storage";
import { removeIntegration } from "../../integrationStorage/integrationCode.storage";
import { getGlobals } from "../../globals";

/**
 * Deletes an integration and all its associated data
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteIntegrationHandler: RequestHandler = async (req, res) => {
  const { logger } = getGlobals();
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

    // Delete integration meta data
    await deleteIntegrationMeta(integrationId);

    // Delete git repository
    await deleteIntegrationGitRepo(integrationId);

    // Delete integration code
    await removeIntegration(integrationId);

    await logger.logIntegrationOtherInfo(
      integrationId,
      "Deleted integration and all associated data",
    );
    logger.info("Deleted integration and all associated data", {
      integrationId,
    });

    // Return success response
    res.status(204).send();
  } catch (error) {
    const integrationId = req.params.id;
    logger.error("Failed to delete integration", { error, integrationId });

    if (error instanceof HttpError) {
      throw error;
    }

    // Check if it's a file not found error
    if (
      error instanceof Error &&
      error.message.includes("Failed to delete integration meta")
    ) {
      throw new HttpError(404, "Integration not found");
    }

    throw new HttpError(500, "Failed to delete integration");
  }
};
