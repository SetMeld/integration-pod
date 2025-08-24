import express, { NextFunction, Request, Response } from "express";
import { createValidateWebId } from "./validateWebId";
import bodyParser from "body-parser";
import { HttpError } from "./HttpError";
import fs from "fs/promises";
import { postCommitHandler } from "./postCommit/postCommit.handler";
import { triggers } from "../triggers/triggers";
import { getLogsHandler, getLogsListHandler } from "./logs/getLogs";
import { generalLogger } from "../utils/logger";
import { createIntegration } from "../integration/createIntegration";
import { listIntegrations } from "../integration/listIntegrations";
import { getIntegration } from "../integration/getIntegration";
import { CreateIntegrationRequest } from "../../common/IntegrationInformation";

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
  apiRouter.get("/integration", async (req, res, next) => {
    console.log("GETTING INTEGRATIONS");
    try {
      const integrations = await listIntegrations();
      res.json(integrations);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/integration", async (req, res, next) => {
    console.log("Received inegration request!", req.body);
    try {
      const request: CreateIntegrationRequest = req.body;
      const result = await createIntegration(request);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/integration/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const integration = await getIntegration(id);
      res.json(integration);
    } catch (error) {
      next(error);
    }
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
  // Get list of available log files for an integration
  apiRouter.get("/integration/:integrationName/logs", getLogsListHandler);

  // Get specific log file content
  apiRouter.get("/integration/:integrationName/logs/:type", getLogsHandler);

  // Legacy endpoints for backward compatibility
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

    const entry = `${sshKey.trim()}\n`;

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
      if (err instanceof Error) {
        generalLogger.error("API error", {
          error: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method,
        });
      } else {
        generalLogger.error("Unknown API error", {
          error: String(err),
          url: req.url,
          method: req.method,
        });
      }
      const error = HttpError.from(err);
      res.status(error.status).send(error.message);
    },
  );

  return apiRouter;
}
