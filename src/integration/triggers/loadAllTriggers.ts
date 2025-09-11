import { updateTrigger } from "./updateTrigger";
import { listIntegrationIds } from "../../integrationStorage/integrationCode.storage";
import { getGlobals } from "../../globals";

export async function loadAllTriggers() {
  const { logger } = getGlobals();
  const ids = await listIntegrationIds();

  logger.info("Found existing repos", { integrationIds: ids });

  return Promise.all(ids.map((id: string) => updateTrigger(id)));
}
