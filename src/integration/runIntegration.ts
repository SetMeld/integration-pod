import path from "path";
import { promises as fs } from "fs";
import { IntegrationResponse } from "./handleIntegrationResponse/IntegrationResponse";
import { handleIntegrationResponse } from "./handleIntegrationResponse/handleIntegrationResponse";
import { getGlobals } from "../globals";

export async function runIntegration(id: string, data: unknown): Promise<void> {
  const { integrationCodePath } = getGlobals();
  // Step 1: Determine project path
  const integrationPath = path.join(integrationCodePath, id);

  // Step 2: Load package.json to get "main" field
  const packageJsonPath = path.join(integrationPath, "package.json");
  const packageJsonRaw = await fs.readFile(packageJsonPath, "utf-8");
  const { main } = JSON.parse(packageJsonRaw);

  if (!main) throw new Error(`No "main" field found in ${packageJsonPath}`);

  // Step 3: Resolve and import the module
  const mainModulePath = path.join(integrationPath, main);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(mainModulePath);

  // Step 4: Check that default export is a function
  if (typeof mod !== "function") {
    throw new Error(
      `Expected default export to be a function in ${mainModulePath}`,
    );
  }

  // Step 5: Run the function with provided data
  const IntegrationResponse = (await mod(data)) as IntegrationResponse;
  await handleIntegrationResponse(IntegrationResponse);
}
