import { RequestHandler } from "express";
import { randomBytes } from "crypto";
import { HttpError } from "../HttpError";
import { IntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import { saveIntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import { createIntegrationGitRepo } from "../../integrationStorage/integrationGit.storage";

export interface CreateIntegrationRequest {
  name: string;
}

/**
 * Generates a unique integration ID
 * @returns A unique string identifier
 */
function generateIntegrationId(): string {
  return randomBytes(8).toString("hex");
}

/**
 * Creates a new integration
 * @param req - Express request object
 * @param res - Express response object
 */
export const createIntegrationHandler: RequestHandler = async (req, res) => {
  console.log("In here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  try {
    const { name }: CreateIntegrationRequest = req.body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new HttpError(
        400,
        "Integration name is required and must be a non-empty string",
      );
    }

    const trimmedName = name.trim();

    // Generate unique integration ID
    const integrationId = generateIntegrationId();

    // Create git repository
    const gitAddress = await createIntegrationGitRepo(integrationId);

    // Create integration meta data
    const integrationMeta: IntegrationMeta = {
      id: integrationId,
      name: trimmedName,
      targetFile: `/integration-data/${integrationId}.ttl`,
      gitAddress,
      status: { type: "ok" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save integration meta data
    await saveIntegrationMeta(integrationMeta);

    console.log(`[${integrationId}] Created new integration: ${trimmedName}`);

    // Return the created integration
    res.status(201).json(integrationMeta);
  } catch (error) {
    console.error("Failed to create integration:", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Failed to create integration");
  }
};
