import express from "express";
import { validateWebId } from "./validateWebId";

export const apiRouter = express.Router();

apiRouter.use(validateWebId);

apiRouter.get("/integration", (req, res) => {
  throw new Error("Not Implemented");
});

apiRouter.post("/integration", (req, res) => {
  throw new Error("Not Implemented");
});

apiRouter.get("/integration/:id", (req, res) => {
  throw new Error("Not Implemented");
});

apiRouter.put("/integration/:id", (req, res) => {
  throw new Error("Not Implemented");
});

apiRouter.put("/integration/:id", (req, res) => {
  throw new Error("Not Implemented");
});

// Logs
apiRouter.get("/integration/:id/log/deploy", (req, res) => {
  throw new Error("Not Implemented");
});

apiRouter.get("/integration/:id/log/trigger", (req, res) => {
  throw new Error("Not Implemented");
});

apiRouter.get("/integration/:id/log/integration", (req, res) => {
  throw new Error("Not Implemented");
});
