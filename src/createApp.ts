import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import path from "path";
import { loadAllTriggers } from "./integration/triggers/loadAllTriggers";
import { setGlobals } from "./globals";
import { ensureIntegrationFolder } from "./integrationStorage/integrationRoute.storage";

export function createApp(base: string, rootFilePath: string): Express {
  const app = express();

  const internalDataFilePath = path.join(rootFilePath, ".internal");
  const integrationCodePath = path.join(
    internalDataFilePath,
    "integration-code",
  );
  const integrationMetaPath = path.join(
    internalDataFilePath,
    "integration-meta",
  );

  setGlobals({
    rootFilePath,
    internalDataFilePath,
    integrationCodePath,
    integrationMetaPath,
  });

  ensureIntegrationFolder();

  const apiRouter = createApiRouter(base);

  app.use("/.integration/api", apiRouter);

  loadAllTriggers();

  return app;
}
