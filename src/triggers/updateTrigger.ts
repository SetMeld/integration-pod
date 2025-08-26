import { getIntegrationConfig } from "../integration/getIntegrationConfig";
import { triggers } from "./triggers";
import { WebhookTriggerConfig } from "./webhook/WebhookTrigger";

export async function updateTrigger(
  id: string,
  integrationCodePath: string,
): Promise<void> {
  const config = await getIntegrationConfig(id, integrationCodePath);
  // TODO: remove the trigger of the previous service if it was different
  const trigger = triggers[config.trigger.type as "webhook"];
  if (!trigger) {
    throw new Error(`Trigger type ${config.trigger.type} not found.`);
  }

  trigger.unregister(id);
  trigger.register(id, config.trigger as WebhookTriggerConfig);
}
