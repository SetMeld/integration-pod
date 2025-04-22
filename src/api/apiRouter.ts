import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import bodyParser from "body-parser";
import { HttpError } from "./HttpError";
import fs from "fs/promises";

export function createApiRouter(base: string) {
  const apiRouter = express.Router();

  apiRouter.use(createValidateWebId(base));

  /**
   * ===========================================================================
   * ITEGRATION FUNCTIONS
   * ===========================================================================
   */
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

  /**
   * ===========================================================================
   * LOGS
   * ===========================================================================
   */
  apiRouter.get("/integration/:id/log/deploy", (req, res) => {
    res.send("These are deploy logs.");
  });

  apiRouter.get("/integration/:id/log/trigger", (req, res) => {
    res.send("These are trigger logs");
  });

  apiRouter.get("/integration/:id/log/integration", (req, res) => {
    res.send("These are integration logs");
  });

  /**
   * ===========================================================================
   * GIT SSH KEY
   * ===========================================================================
   */
  const AUTHORIZED_KEYS_PATH = "/authorized_keys";

  apiRouter.post("/git-ssh-key", bodyParser.json(), async (req, res) => {
    const { sshKey } = req.body;

    // Basic validation (optional: do better key format checking)
    if (!sshKey || !sshKey.startsWith("ssh-")) {
      throw new HttpError(400, "Invalid SSH key");
    }

    // Special command to ensure security for SSH connections
    const command =
      "command='GIT_PROJECT_ROOT=/srv/git git-shell -c \"$SSH_ORIGINAL_COMMAND\"',no-port-forwarding,no-X11-forwarding,no-agent-forwarding";
    const entry = `${command} ${sshKey.trim()}\n`;

    await fs.writeFile(AUTHORIZED_KEYS_PATH, entry, { mode: 0o600 });
    res.json({ success: true });
  });

  /**
   * ===========================================================================
   * ERROR HANDLING
   * ===========================================================================
   */
  apiRouter.use(
    (err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const error = HttpError.from(err);
      res.status(error.status).send(error.message);
    },
  );

  return apiRouter;
}
