import { updateTrigger } from "./updateTrigger";
import { listIntegrationIds } from "../../integrationStorage/integrationCode.storage";

export async function loadAllTriggers() {
  const ids = await listIntegrationIds();

  console.log("Found existing repos:", ids);

  return Promise.all(ids.map((id: string) => updateTrigger(id)));
}
