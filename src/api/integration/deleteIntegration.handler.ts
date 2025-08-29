import { RequestHandler } from "express";
import { HttpError } from "../HttpError";
import { deleteIntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import { deleteIntegrationGitRepo } from "../../integrationStorage/integrationGit.storage";
import { removeIntegration } from "../../integrationStorage/integrationCode.storage";

/**
 * Deletes an integration and all its associated data
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteIntegrationHandler: RequestHandler = async (req, res) => {
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

    console.log(
      `[${integrationId}] Deleted integration and all associated data`,
    );

    // Return success response
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete integration:", error);

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
