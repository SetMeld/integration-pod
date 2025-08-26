import { getGlobals } from "../globals";
import { IntegrationReturn } from "./IntegrationReturn";
import { processAccount } from "./accounts/processAccount";
import { applyResourceOrContainerUpdate } from "./files/applyResourceOrContainerUpdate";

export async function handleIntegrationReturn(
  integrationReturn: IntegrationReturn,
): Promise<void> {
  const { rootFilePath } = getGlobals();
  console.log("Integration Return", integrationReturn);
  // Process Accounts
  await Promise.all(
    integrationReturn?.accounts?.map((accountChanges) =>
      processAccount(accountChanges),
    ) ?? [],
  );
  // Process files
  await Promise.all(
    integrationReturn?.files?.map((item) =>
      applyResourceOrContainerUpdate(item, rootFilePath),
    ) ?? [],
  );
}
