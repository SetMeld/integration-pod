import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import bodyParser from "body-parser";
import { HttpError } from "./HttpError";
import fs from "fs/promises";
import { postCommitHandler } from "./postCommit/postCommit.handler";
import { triggers } from "../integration/triggers/triggers";
import { getGlobals } from "../globals";
import path from "path";

export function createApiRouter(base: string) {
  const apiRouter = express.Router();

  /**
   * ===========================================================================
   * GIT COMMIT HOOK
   * ===========================================================================
   */
  apiRouter.post("/git-commit-hook", bodyParser.json(), postCommitHandler);

  /**
   * ===========================================================================
   * TRIGGERS
   * ===========================================================================
   */
  apiRouter.use(
    "/webhook",
    triggers.webhook.handleRequest.bind(triggers.webhook),
  );

  /**
   * ===========================================================================
   * AUTHENTICATED FUNCTIONS
   * ===========================================================================
   */
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
        name: "Salesforce Integration",
        targetFile: "/integration-data/1.ttl",
        gitAddress: "ssh://localhost:2222/srv/git/1.git",
        status: {
          type: "ok",
        },
      },
      {
        id: "2",
        name: "Custom SQL Integration",
        targetFile: "/integration-data/2.ttl",
        gitAddress: "ssh://localhost:2222/srv/git/2.git",
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
      targetFile: "/integration-data/6.ttl",
      gitAddress: "ssh://localhost:2222/srv/git/6.git",
      status: {
        type: "ok",
      },
    });
  });

  apiRouter.get("/integration/:id", (req, res) => {
    res.json({
      id: "2",
      name: "Custom SQL Integration",
      targetFile: "/integration-data/2.ttl",
      gitAddress: "ssh://localhost:2222/srv/git/2.git",
      status: {
        type: "ok",
      },
    });
  });

  apiRouter.put("/integration/:id", (req, res) => {
    res.json({
      id: "1",
      name: "Some Integration",
      targetFile: "/integration-data/1.ttl",
      gitAddress: "ssh://localhost:2222/srv/git/1.git",
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
  apiRouter.post("/git-ssh-key", bodyParser.json(), async (req, res) => {
    const { sshKey } = req.body;

    // Basic validation (optional: do better key format checking)
    if (!sshKey || !sshKey.startsWith("ssh-")) {
      throw new HttpError(400, "Invalid SSH key");
    }

    const entry = `${sshKey.trim()}\n`;

    const { internalDataFilePath } = getGlobals();
    const authorizedKeysPath = path.join(
      internalDataFilePath,
      "authorized_keys",
    );

    await fs.writeFile(authorizedKeysPath, entry, { mode: 0o600 });
    res.json({ success: true });
  });

  /**
   * ===========================================================================
   * ERROR HANDLING
   * ===========================================================================
   */
  apiRouter.use(
    (err: unknown, req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof Error) {
        console.error(err);
      }
      const error = HttpError.from(err);
      res.status(error.status).send(error.message);
    },
  );

  return apiRouter;
}
