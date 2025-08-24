import { promises as fs } from "fs";
import path from "path";
import { IntegrationInformation } from "../../common/IntegrationInformation";
import { generalLogger } from "../utils/logger";

export async function listIntegrations(): Promise<IntegrationInformation[]> {
  try {
    const integrationsPath = "/app/integrations";
    const entries = await fs.readdir(integrationsPath, { withFileTypes: true });

    const integrations: IntegrationInformation[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const integrationId = entry.name;
        const metadataPath = path.join(
          integrationsPath,
          integrationId,
          "metadata.json",
        );

        try {
          const metadataContent = await fs.readFile(metadataPath, "utf-8");
          const metadata: IntegrationInformation = JSON.parse(metadataContent);

          // Return the metadata directly since it already has all the fields we need
          integrations.push(metadata);
        } catch (error) {
          generalLogger.warn("Failed to read metadata for integration", {
            integrationId,
            error,
          });
          // Skip integrations with invalid metadata
        }
      }
    }

    return integrations;
  } catch (error) {
    generalLogger.error("Error listing integrations", { error });
    return [];
  }
}
