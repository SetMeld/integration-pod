import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import path from "path";
import { loadAllTriggers } from "./triggers/loadAllTriggers";
import { initializeLogging } from "./utils/initLogging";

export async function createApp(base: string): Promise<Express> {
  // Initialize logging system
  await initializeLogging();

  const app = express();

  const apiRouter = createApiRouter(base);

  app.use("/.integration/api", apiRouter);

  const uiPath = path.resolve(__dirname, "ui");
  app.use("/.integration", express.static(uiPath));

  app.get(new RegExp("^/\\.integration/.*"), (req, res) => {
    res.sendFile(path.join(uiPath, "index.html"));
  });

  loadAllTriggers();

  return app;
}
