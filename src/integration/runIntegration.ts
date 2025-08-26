import path from "path";
import { IntegrationResponse } from "./handleIntegrationResponse/IntegrationResponse";
import { handleIntegrationResponse } from "./handleIntegrationResponse/handleIntegrationResponse";
import { getGlobals } from "../globals";
import {
  readPackageJson,
  getIntegrationPath,
} from "../integrationStorage/integrationCode.storage";

export async function runIntegration(id: string, data: unknown): Promise<void> {
  const { integrationCodePath } = getGlobals();

  // Step 1: Load package.json to get "main" field
  const { main } = await readPackageJson(id);

  // Step 2: Resolve and import the module
  const integrationPath = getIntegrationPath(id);
  const mainModulePath = path.join(integrationPath, main);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(mainModulePath);

  // Step 3: Check that default export is a function
  if (typeof mod !== "function") {
    throw new Error(
      `Expected default export to be a function in ${mainModulePath}`,
    );
  }

  // Step 4: Run the function with provided data
  const IntegrationResponse = (await mod(data)) as IntegrationResponse;
  await handleIntegrationResponse(IntegrationResponse);
}
