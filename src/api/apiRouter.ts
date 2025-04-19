import express from "express";
import { createValidateWebId } from "./validateWebId";

export function createApiRouter(base: string) {
  const apiRouter = express.Router();

  apiRouter.use(createValidateWebId(base));

  apiRouter.get("/integration", (req, res) => {
    res.json([
      {
        id: "1",
        name: "Some Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          type: "ok",
        },
      },
      {
        id: "2",
        name: "Another Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          type: "ok",
        },
      },
      {
        id: "3",
        name: "Hello Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          type: "error",
          message: "There was some kind of error here. I don't like it.",
        },
      },
      {
        id: "4",
        name: "Weehee Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          type: "ok",
        },
      },
      {
        id: "5",
        name: "My cool Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          type: "ok",
        },
      },
    ]);
  });

  apiRouter.post("/integration", (req, res) => {
    res.json({
      id: "6",
      name: "Some Name",
      targetFile: "/path/to/file/",
      gitAddress: "@git:example",
      status: {
        type: "ok",
      },
    });
  });

  apiRouter.get("/integration/:id", (req, res) => {
    res.json({
      id: "5",
      name: "My cool Integration",
      targetFile: "/path/to/file/",
      gitAddress: "@git:example",
      status: {
        type: "ok",
      },
    });
  });

  apiRouter.put("/integration/:id", (req, res) => {
    res.json({
      id: "1",
      name: "Some Integration",
      targetFile: "/path/to/file/",
      gitAddress: "@git:example",
      status: {
        type: "ok",
      },
    });
  });

  // Logs
  apiRouter.get("/integration/:id/log/deploy", (req, res) => {
    res.send("These are deploy logs.");
  });

  apiRouter.get("/integration/:id/log/trigger", (req, res) => {
    res.send("These are trigger logs");
  });

  apiRouter.get("/integration/:id/log/integration", (req, res) => {
    res.send("These are integration logs");
  });

  return apiRouter;
}
