import { RequestHandler } from "express";
import { HttpError } from "../HttpError";
import { IntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import {
  readIntegrationMeta,
  saveIntegrationMeta,
} from "../../integrationStorage/integrationMeta.storage";

export type UpdateableIntegrationMetaRequest = Pick<
  IntegrationMeta,
  "name" | "targetFile"
>;

/**
 * Updates an existing integration's meta data
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateIntegrationHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateableIntegrationMetaRequest = req.body;

    // Validate input
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new HttpError(
        400,
        "Integration ID is required and must be a non-empty string",
      );
    }

    const integrationId = id.trim();

    // Validate update data
    if (!updateData || typeof updateData !== "object") {
      throw new HttpError(400, "Update data is required and must be an object");
    }

    // Validate name if provided
    if (updateData.name !== undefined) {
      if (
        typeof updateData.name !== "string" ||
        updateData.name.trim().length === 0
      ) {
        throw new HttpError(400, "Integration name must be a non-empty string");
      }
    }

    // Validate targetFile if provided
    if (updateData.targetFile !== undefined) {
      if (
        typeof updateData.targetFile !== "string" ||
        updateData.targetFile.trim().length === 0
      ) {
        throw new HttpError(400, "Target file must be a non-empty string");
      }
    }

    // Read existing integration meta data
    const existingMeta = await readIntegrationMeta(integrationId);

    // Create updated meta data
    const updatedMeta: IntegrationMeta = {
      ...existingMeta,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Save the updated meta data
    await saveIntegrationMeta(updatedMeta);

    console.log(`[${integrationId}] Updated integration: ${updatedMeta.name}`);

    // Return the updated integration
    res.json(updatedMeta);
  } catch (error) {
    console.error("Failed to update integration:", error);

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

    throw new HttpError(500, "Failed to update integration");
  }
};
