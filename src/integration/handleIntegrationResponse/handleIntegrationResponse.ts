import { getGlobals } from "../../globals";
import { IntegrationResponse } from "./IntegrationResponse";
import { processAccount } from "./accounts/processAccount";
import { applyResourceOrContainerUpdate } from "./files/applyResourceOrContainerUpdate";

/**
 * Handles the data returned from the integration by updating proper files.
 */
export async function handleIntegrationResponse(
  IntegrationResponse: IntegrationResponse,
): Promise<void> {
  const { rootFilePath } = getGlobals();
  console.log("Integration Return", IntegrationResponse);
  // Process Accounts
  await Promise.all(
    IntegrationResponse?.accounts?.map((accountChanges) =>
      processAccount(accountChanges),
    ) ?? [],
  );
  // Process files
  await Promise.all(
    IntegrationResponse?.files?.map((item) =>
      applyResourceOrContainerUpdate(item, rootFilePath),
    ) ?? [],
  );
}
