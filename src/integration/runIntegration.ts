import path from "path";
import { IntegrationResponse } from "./handleIntegrationResponse/IntegrationResponse";
import { handleIntegrationResponse } from "./handleIntegrationResponse/handleIntegrationResponse";
import { getGlobals } from "../globals";
import {
  readPackageJson,
  getIntegrationPath,
} from "../integrationStorage/integrationCode.storage";

export async function runIntegration(id: string, data: unknown): Promise<void> {
  const { logger } = getGlobals();

  try {
    await logger.logIntegrationExecInfo(id, "Starting integration execution", {
      data,
    });

    // Step 1: Load package.json to get "main" field
    const { main } = await readPackageJson(id);
    await logger.logIntegrationExecInfo(
      id,
      `Loaded package.json with main: ${main}`,
    );

    // Step 2: Resolve and import the module
    const integrationPath = getIntegrationPath(id);
    const mainModulePath = path.join(integrationPath, main);
    await logger.logIntegrationExecInfo(
      id,
      `Loading module from: ${mainModulePath}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(mainModulePath);

    // Step 3: Check that default export is a function
    if (typeof mod !== "function") {
      const error = `Expected default export to be a function in ${mainModulePath}`;
      await logger.logIntegrationExecError(id, error);
      throw new Error(error);
    }

    // Step 4: Run the function with provided data
    await logger.logIntegrationExecInfo(id, "Executing integration function");
    const IntegrationResponse = (await mod(data)) as IntegrationResponse;

    await logger.logIntegrationExecInfo(
      id,
      "Integration execution completed, handling response",
    );
    await handleIntegrationResponse(IntegrationResponse);

    await logger.logIntegrationExecInfo(
      id,
      "Integration execution finished successfully",
    );
  } catch (error) {
    await logger.logIntegrationExecError(id, "Integration execution failed", {
      error,
    });
    throw error;
  }
}
