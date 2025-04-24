import path from "path";
import { IntegrationConfig } from "./IntegrationConfig";
import fs from "fs/promises";

export async function getIntegrationConfig(
  id: string,
): Promise<IntegrationConfig> {
  const integrationJsonPath = path.join(
    "/app/integrations",
    id,
    "integration.json",
  );
  const integrationDataRaw = await fs.readFile(integrationJsonPath, "utf-8");
  const integrationData = JSON.parse(integrationDataRaw) as IntegrationConfig;
  return integrationData;
}
