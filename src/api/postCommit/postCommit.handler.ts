import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { updateTrigger } from "../../integration/triggers/updateTrigger";
import {
  getIntegrationPath,
  removeIntegration,
} from "../../integrationStorage/integrationCode.storage";
const execAsync = promisify(exec);

export const postCommitHandler: RequestHandler = async (req, res) => {
  try {
    const { repo, ref, oldrev, newrev } = req.body;

    // Extract repo name (e.g., "demo" from "/srv/git/demo.git")
    const integrationId = path.basename(repo, ".git");
    const clonePath = getIntegrationPath(integrationId);

    console.log(`[HOOK] Received push to ${ref} for ${integrationId}`);
    console.log(`[HOOK] Old: ${oldrev}`);
    console.log(`[HOOK] New: ${newrev}`);
    console.log(`[HOOK] Clone path: ${clonePath}`);

    // If the repo folder already exists, delete it
    await removeIntegration(integrationId);

    // Clone the repo
    const cloneCmd = `git clone ${repo} ${clonePath}`;
    console.log(`[HOOK] Running: ${cloneCmd}`);
    await execAsync(cloneCmd);

    // Run npm install inside the cloned repo
    const installCmd = `cd ${clonePath} && npm install`;
    console.log(`[HOOK] Running: ${installCmd}`);
    await execAsync(installCmd);

    // Load integration.json
    await updateTrigger(integrationId);

    res.json({
      success: true,
      repo: integrationId,
    });
  } catch (err) {
    console.error("[HOOK] Error processing push:", err);
    res.status(500).json({ error: "Failed to process integration repo." });
  }
};
