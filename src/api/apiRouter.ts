import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import bodyParser from "body-parser";
import { HttpError } from "./HttpError";
import fs from "fs/promises";
import { postCommitHandler } from "./postCommit/postCommit.handler";
import { triggers } from "../integration/triggers/triggers";
import { getGlobals } from "../globals";
import path from "path";
import { createIntegrationHandler } from "./integration/createIntegration.handler";
import { readIntegrationsHandler } from "./integration/readIntegrations.handler";
import { readIntegrationHandler } from "./integration/readIntegration.handler";
import { updateIntegrationHandler } from "./integration/updateIntegration.handler";
import { deleteIntegrationHandler } from "./integration/deleteIntegration.handler";

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
  apiRouter.get("/integration", readIntegrationsHandler);

  apiRouter.post("/integration", bodyParser.json(), createIntegrationHandler);

  apiRouter.get("/integration/:id", readIntegrationHandler);

  apiRouter.put(
    "/integration/:id",
    bodyParser.json(),
    updateIntegrationHandler,
  );

  apiRouter.delete("/integration/:id", deleteIntegrationHandler);

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
