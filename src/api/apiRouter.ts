import express from "express";
import { createValidateWebId } from "./validateWebId";

export function createApiRouter(base: string) {
  const apiRouter = express.Router();

  apiRouter.use(createValidateWebId(base));

  apiRouter.get("/integration", (req, res) => {
    res.send("Root");
  });

  apiRouter.post("/integration", (req, res) => {
    res.send("Root");
  });

  apiRouter.get("/integration/:id", (req, res) => {
    res.send("id");
  });

  apiRouter.put("/integration/:id", (req, res) => {
    res.send("id");
  });

  apiRouter.put("/integration/:id", (req, res) => {
    res.send("id");
  });

  // Logs
  apiRouter.get("/integration/:id/log/deploy", (req, res) => {
    res.send("logs");
  });

  apiRouter.get("/integration/:id/log/trigger", (req, res) => {
    res.send("logs");
  });

  apiRouter.get("/integration/:id/log/integration", (req, res) => {
    res.send("logs");
  });

  return apiRouter;
}
