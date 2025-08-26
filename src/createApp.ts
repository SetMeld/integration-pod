import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import path from "path";
import { loadAllTriggers } from "./triggers/loadAllTriggers";
import { setGlobals } from "./globals";

export function createApp(base: string, rootFilePath: string): Express {
  const app = express();

  const internalDataFilePath = path.join(rootFilePath, ".internal");
  const integrationCodePath = path.join(
    internalDataFilePath,
    "integration-code",
  );

  setGlobals({
    rootFilePath,
    internalDataFilePath,
    integrationCodePath,
  });

  const apiRouter = createApiRouter(base);

  app.use("/.integration/api", apiRouter);

  const uiPath = path.resolve(__dirname, "ui");
  app.use("/.integration", express.static(uiPath));

  app.get(new RegExp("^/\\.integration/.*"), (req, res) => {
    res.sendFile(path.join(uiPath, "index.html"));
  });

  loadAllTriggers(internalDataFilePath);

  return app;
}
