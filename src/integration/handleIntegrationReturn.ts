import { IntegrationReturn } from "./IntegrationReturn";
import { processAccount } from "./accounts/processAccount";
import { processFiles } from "./files/processFiles";
import { createIntegrationLogger } from "../utils/logger";

const BASE_PATH = "/app/data";

export async function handleIntegrationReturn(
  integrationReturn: IntegrationReturn,
  integrationName: string,
): Promise<void> {
  const logger = createIntegrationLogger(integrationName);

  logger.info("Processing integration return", {
    accountsCount: integrationReturn?.accounts?.length || 0,
    filesCount: integrationReturn?.files?.length || 0,
  });

  // Process Accounts
  await Promise.all(
    integrationReturn?.accounts?.map((accountChanges) =>
      processAccount(accountChanges),
    ) ?? [],
  );

  logger.info("Accounts processed successfully");

  // Process files
  await Promise.all(
    integrationReturn?.files?.map((item) => processFiles(item, BASE_PATH)) ??
      [],
  );

  logger.info("Files processed successfully");
}
