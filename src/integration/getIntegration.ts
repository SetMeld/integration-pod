import { promises as fs } from "fs";
import path from "path";
import { IntegrationInformation } from "../../common/IntegrationInformation";
import { HttpError } from "../api/HttpError";
import { createIntegrationLogger } from "../utils/logger";

export async function getIntegration(
  id: string,
): Promise<IntegrationInformation> {
  const logger = createIntegrationLogger(id);

  try {
    const integrationPath = path.join("/app/integrations", id);
    const metadataPath = path.join(integrationPath, "metadata.json");

    // Check if integration directory exists
    try {
      await fs.access(integrationPath);
    } catch {
      throw new HttpError(404, `Integration with id "${id}" not found`);
    }

    // Check if metadata file exists
    try {
      await fs.access(metadataPath);
    } catch {
      throw new HttpError(
        404,
        `Integration with id "${id}" has no metadata file`,
      );
    }

    // Read and parse metadata
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata: IntegrationInformation = JSON.parse(metadataContent);

    return metadata;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error("Error getting integration", { error });
    throw new HttpError(500, "Failed to get integration");
  }
}
