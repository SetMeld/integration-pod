import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { updateTrigger } from "../../triggers/updateTrigger";
import { createIntegrationLogger, logCommandOutput } from "../../utils/logger";

const execAsync = promisify(exec);

export const postCommitHandler: RequestHandler = async (req, res) => {
  try {
    const { repo, ref, oldrev, newrev } = req.body;

    // Extract repo name (e.g., "demo" from "/srv/git/demo.git")
    const repoName = path.basename(repo, ".git");
    const clonePath = `/app/integrations/${repoName}`;
    const logger = createIntegrationLogger(repoName);

    logger.info("Received push hook", {
      ref,
      oldrev,
      newrev,
      clonePath,
    });

    // If the repo folder already exists, delete it
    await fs.rm(clonePath, { recursive: true, force: true });
    logger.info("Removed existing integration directory");

    // Clone the repo
    const cloneCmd = `git clone ${repo} ${clonePath}`;
    logger.info("Cloning repository", { command: cloneCmd });

    try {
      const cloneResult = await execAsync(cloneCmd);
      await logCommandOutput(
        repoName,
        cloneCmd,
        cloneResult.stdout,
        cloneResult.stderr,
        0,
      );
      logger.info("Repository cloned successfully");
    } catch (error) {
      const execError = error as {
        stdout?: string;
        stderr?: string;
        code?: number;
      };
      await logCommandOutput(
        repoName,
        cloneCmd,
        execError.stdout || "",
        execError.stderr || "",
        execError.code || 1,
      );
      throw error;
    }

    // Run npm install inside the cloned repo
    const installCmd = `cd ${clonePath} && npm install`;
    logger.info("Installing dependencies", { command: installCmd });

    try {
      const installResult = await execAsync(installCmd);
      await logCommandOutput(
        repoName,
        installCmd,
        installResult.stdout,
        installResult.stderr,
        0,
      );
      logger.info("Dependencies installed successfully");
    } catch (error) {
      const execError = error as {
        stdout?: string;
        stderr?: string;
        code?: number;
      };
      await logCommandOutput(
        repoName,
        installCmd,
        execError.stdout || "",
        execError.stderr || "",
        execError.code || 1,
      );
      throw error;
    }

    // Load integration.json
    updateTrigger(repoName);
    logger.info("Integration trigger updated");

    res.json({
      success: true,
      repo: repoName,
    });
  } catch (err) {
    const repoName = path.basename(req.body.repo || "", ".git");
    const logger = createIntegrationLogger(repoName);
    logger.error("Error processing push hook", { error: err });
    res.status(500).json({ error: "Failed to process integration repo." });
  }
};
