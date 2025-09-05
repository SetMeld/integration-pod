import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import path from "path";
import { loadAllTriggers } from "./integration/triggers/loadAllTriggers";
import { setGlobals } from "./globals";
import { ensureIntegrationFolder } from "./integrationStorage/integrationRoute.storage";
import { installGitHooksForAllRepos } from "./integrationStorage/integrationGit.storage";

export function createApp(
  base: string,
  rootFilePath: string,
  gitUri: string,
): Express {
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
  const integrationGitPath = path.join(internalDataFilePath, "integration-git");

  setGlobals({
    baseUrl: base,
    rootFilePath,
    gitUri,
    internalDataFilePath,
    integrationCodePath,
    integrationMetaPath,
    integrationGitPath,
  });

  ensureIntegrationFolder();

  // Install git hooks for all existing repositories
  installGitHooksForAllRepos();

  const apiRouter = createApiRouter();

  app.use("/.integration/api", apiRouter);

  loadAllTriggers();

  return app;
}
