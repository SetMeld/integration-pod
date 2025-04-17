import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import path from "path";

export function createApp(base: string): Express {
  const app = express();

  const apiRouter = createApiRouter(base);

  app.use("/.integration/api", apiRouter);

  const uiPath = path.resolve(__dirname, "ui");
  app.use("/.integration", express.static(uiPath));

  app.get(new RegExp("^/\\.integration/.*"), (req, res) => {
    res.sendFile(path.join(uiPath, "index.html"));
  });

  return app;
}
