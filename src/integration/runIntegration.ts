import path from "path";
import { promises as fs } from "fs";
import { IntegrationReturn } from "./IntegrationReturn";
import { handleIntegrationReturn } from "./handleIntegrationReturn";
import { createIntegrationLogger, logIntegrationRun } from "../utils/logger";
import { captureConsoleForIntegration } from "../utils/consoleCapture";

export async function runIntegration(id: string, data: unknown): Promise<void> {
  const logger = createIntegrationLogger(id);
  const capturedConsole = captureConsoleForIntegration(id);

  try {
    logger.info("Starting integration run", { data });

    // Step 1: Determine project path
    const integrationPath = path.join("/app/integrations", id);
    logger.debug("Integration path", { integrationPath });

    // Step 2: Load package.json to get "main" field
    const packageJsonPath = path.join(integrationPath, "package.json");
    const packageJsonRaw = await fs.readFile(packageJsonPath, "utf-8");
    const { main } = JSON.parse(packageJsonRaw);

    if (!main) {
      const error = new Error(`No "main" field found in ${packageJsonPath}`);
      logger.error("Package.json missing main field", { packageJsonPath });
      throw error;
    }

    logger.debug("Package.json loaded", { main });

    // Step 3: Resolve and import the module
    const mainModulePath = path.join(integrationPath, main);
    logger.debug("Loading integration module", { mainModulePath });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(mainModulePath);

    // Step 4: Check that default export is a function
    if (typeof mod !== "function") {
      const error = new Error(
        `Expected default export to be a function in ${mainModulePath}`,
      );
      logger.error("Invalid integration module", {
        mainModulePath,
        type: typeof mod,
      });
      throw error;
    }

    // Step 5: Run the function with provided data
    logger.info("Executing integration function");
    const integrationReturn = (await mod(data)) as IntegrationReturn;

    logger.info("Integration function completed", {
      hasAccounts: !!integrationReturn?.accounts,
      hasFiles: !!integrationReturn?.files,
    });

    // Step 6: Handle the integration return
    await handleIntegrationReturn(integrationReturn, id);

    logger.info("Integration run completed successfully");
    logIntegrationRun(id, data, integrationReturn);
  } catch (error) {
    logger.error("Integration run failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    logIntegrationRun(
      id,
      data,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  } finally {
    // Always restore console to prevent affecting other integrations
    capturedConsole.restore();
  }
}
