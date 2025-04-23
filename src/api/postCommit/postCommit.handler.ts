import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { triggers } from "../../triggers/triggers";
import { WebhookTriggerConfig } from "../../triggers/WebhookTrigger";

const execAsync = promisify(exec);

export const postCommitHandler: RequestHandler = async (req, res) => {
  try {
    const { repo, ref, oldrev, newrev } = req.body;

    // Extract repo name (e.g., "demo" from "/srv/git/demo.git")
    const repoName = path.basename(repo, ".git");
    const clonePath = `/app/integrations/${repoName}`;

    console.log(`[HOOK] Received push to ${ref} for ${repoName}`);
    console.log(`[HOOK] Old: ${oldrev}`);
    console.log(`[HOOK] New: ${newrev}`);
    console.log(`[HOOK] Clone path: ${clonePath}`);

    // If the repo folder already exists, delete it
    await fs.rm(clonePath, { recursive: true, force: true });

    // Clone the repo
    const cloneCmd = `git clone ${repo} ${clonePath}`;
    console.log(`[HOOK] Running: ${cloneCmd}`);
    await execAsync(cloneCmd);

    // Run npm install inside the cloned repo
    const installCmd = `cd ${clonePath} && npm install`;
    console.log(`[HOOK] Running: ${installCmd}`);
    await execAsync(installCmd);

    // Load integration.json
    const integrationJsonPath = path.join(clonePath, "integration.json");
    const integrationDataRaw = await fs.readFile(integrationJsonPath, "utf-8");
    const integrationData = JSON.parse(integrationDataRaw) as {
      trigger: { type: string };
    };

    console.log(
      `[HOOK] integration.json loaded for ${repoName}`,
      integrationData,
    );

    // TODO: remove the trigger of the previous service if it was different
    const trigger = triggers[integrationData.trigger.type as "webhook"];
    if (!trigger) {
      throw new Error(
        `Trigger type ${integrationData.trigger.type} not found.`,
      );
    }

    trigger.unregister(repoName);
    trigger.register(repoName, integrationData.trigger as WebhookTriggerConfig);

    res.json({
      success: true,
      repo: repoName,
      integration: integrationData,
    });
  } catch (err) {
    console.error("[HOOK] Error processing push:", err);
    res.status(500).json({ error: "Failed to process integration repo." });
  }
};
