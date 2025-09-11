import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { updateTrigger } from "../../integration/triggers/updateTrigger";
import {
  getIntegrationPath,
  removeIntegration,
} from "../../integrationStorage/integrationCode.storage";
import { getGlobals } from "../../globals";
const execAsync = promisify(exec);

export const postCommitHandler: RequestHandler = async (req, res) => {
  try {
    const { repo, ref, oldrev, newrev } = req.body;
    const { logger } = getGlobals();

    // Extract repo name (e.g., "demo" from "/srv/git/demo.git")
    const integrationId = path.basename(repo, ".git");
    const clonePath = getIntegrationPath(integrationId);

    await logger.logDeployInfo(integrationId, `Received push to ${ref}`, {
      oldrev,
      newrev,
      clonePath,
    });

    // If the repo folder already exists, delete it
    await removeIntegration(integrationId);

    // Clone the repo
    const cloneCmd = `git clone ${repo} ${clonePath}`;
    await logger.logDeployInfo(integrationId, "Running git clone", {
      command: cloneCmd,
    });
    await execAsync(cloneCmd);

    // Run npm install inside the cloned repo
    const installCmd = `cd ${clonePath} && npm install`;
    await logger.logDeployInfo(integrationId, "Running npm install", {
      command: installCmd,
    });
    await execAsync(installCmd);

    // Load integration.json
    await updateTrigger(integrationId);

    await logger.logDeployInfo(
      integrationId,
      "Integration deployment completed successfully",
    );

    res.json({
      success: true,
      repo: integrationId,
    });
  } catch (err) {
    const { logger } = getGlobals();
    const integrationId = req.body?.repo
      ? path.basename(req.body.repo, ".git")
      : "unknown";

    await logger.logDeployError(integrationId, "Error processing push", {
      error: err,
    });
    logger.error("Error processing push", { error: err, integrationId });

    res.status(500).json({ error: "Failed to process integration repo." });
  }
};
