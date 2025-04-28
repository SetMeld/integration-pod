import { IntegrationReturn } from "./IntegrationReturn";
import { processAccount } from "./accounts/processAccount";
import { processFiles } from "./files/processFiles";

const BASE_PATH = "/app/data";

export async function handleIntegrationReturn(
  integrationReturn: IntegrationReturn,
): Promise<void> {
  console.log("Integration Return", integrationReturn);
  // Process Accounts
  await Promise.all(
    integrationReturn?.accounts?.map((accountChanges) =>
      processAccount(accountChanges),
    ) ?? [],
  );
  // Process files
  await Promise.all(
    integrationReturn?.files?.map((item) => processFiles(item, BASE_PATH)) ??
      [],
  );
}
