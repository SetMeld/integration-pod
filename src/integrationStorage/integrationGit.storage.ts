// Handles files in `/.internal/integration-git/`

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { getGlobals } from "../globals";

const execAsync = promisify(exec);

/**
 * Installs the post-receive hook in a git repository
 * @param gitRepoPath - The path to the git repository
 * @param integrationId - The integration ID for logging
 */
async function installGitHook(
  gitRepoPath: string,
  integrationId: string,
): Promise<void> {
  try {
    const hooksDir = path.join(gitRepoPath, "hooks");
    const hookPath = path.join(hooksDir, "post-receive");

    // Determine the source hook path based on environment
    const sourceHookPath = path.join(
      __dirname,
      "..",
      "git-hooks",
      "post-receive",
    );

    // Check if source hook exists
    try {
      await fs.access(sourceHookPath);
    } catch {
      const { logger } = getGlobals();
      await logger.logIntegrationOtherInfo(
        integrationId,
        `Git hook not found at ${sourceHookPath}, skipping hook installation`,
      );
      return;
    }

    // Read the template hook file and replace the placeholder with actual base URL
    const { baseUrl } = getGlobals();
    const hookTemplate = await fs.readFile(sourceHookPath, "utf-8");
    const customizedHook = hookTemplate.replace(
      "__CSS_BASE_URL_PLACEHOLDER__",
      baseUrl,
    );

    // Write the customized hook file
    await fs.writeFile(hookPath, customizedHook, "utf-8");

    // Make it executable
    await fs.chmod(hookPath, 0o755);

    const { logger } = getGlobals();
    await logger.logIntegrationOtherInfo(
      integrationId,
      `Installed git post-receive hook at ${hookPath}`,
    );
  } catch (error) {
    const { logger } = getGlobals();
    await logger.logIntegrationOtherError(
      integrationId,
      "Failed to install git hook",
      { error },
    );
    // Don't throw - hook installation failure shouldn't prevent repo creation
  }
}

/**
 * Creates a new bare git repository for an integration
 * @param integrationId - The unique identifier for the integration
 */
export async function createIntegrationGitRepo(
  integrationId: string,
): Promise<void> {
  const { integrationGitPath } = getGlobals();
  const gitRepoPath = path.join(integrationGitPath, `${integrationId}.git`);

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(path.dirname(gitRepoPath), { recursive: true });

    // Initialize a bare git repository
    await execAsync(`git init --bare "${gitRepoPath}"`);

    // Install the post-receive hook
    await installGitHook(gitRepoPath, integrationId);

    const { logger } = getGlobals();
    await logger.logIntegrationOtherInfo(
      integrationId,
      `Created git repository at ${gitRepoPath}`,
    );
  } catch (error) {
    const { logger } = getGlobals();
    await logger.logIntegrationOtherError(
      integrationId,
      "Failed to create git repository",
      { error },
    );
    logger.error(`Failed to create git repository for ${integrationId}`, {
      error,
    });
    throw new Error(
      `Failed to create git repository for integration ${integrationId}`,
    );
  }
}

/**
 * Gets the git repository path for an integration
 * @param integrationId - The unique identifier for the integration
 * @returns The path to the git repository
 */
export function getIntegrationGitPath(integrationId: string): string {
  const { integrationGitPath } = getGlobals();
  return path.join(integrationGitPath, `${integrationId}.git`);
}

/**
 * Gets the SSH URL for an integration repository
 * @param integrationId - The unique identifier for the integration
 * @returns The SSH URL for the git repository
 */
export function getIntegrationGitSshUrl(integrationId: string): string {
  const { gitUri, integrationGitPath } = getGlobals();

  return `ssh://${gitUri}${integrationGitPath}/${integrationId}.git`;
}

/**
 * Checks if a git repository exists for an integration
 * @param integrationId - The unique identifier for the integration
 * @returns True if the repository exists, false otherwise
 */
export async function integrationGitRepoExists(
  integrationId: string,
): Promise<boolean> {
  try {
    const gitRepoPath = getIntegrationGitPath(integrationId);
    await fs.access(gitRepoPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Installs git hooks for all existing git repositories
 * This function scans the integration-git directory and installs hooks for any existing repositories
 */
export async function installGitHooksForAllRepos(): Promise<void> {
  const { integrationGitPath, logger } = getGlobals();

  try {
    const entries = await fs.readdir(integrationGitPath, {
      withFileTypes: true,
    });
    const gitRepos = entries
      .filter((dirent) => dirent.isDirectory() && dirent.name.endsWith(".git"))
      .map((dirent) => dirent.name);

    logger.info(`Found ${gitRepos.length} existing git repositories`, {
      gitRepos,
    });

    for (const repoName of gitRepos) {
      const integrationId = path.basename(repoName, ".git");
      const repoPath = path.join(integrationGitPath, repoName);
      await installGitHook(repoPath, integrationId);
    }

    if (gitRepos.length > 0) {
      logger.info(
        `Successfully processed git hooks for ${gitRepos.length} repositories`,
      );
    }
  } catch (error) {
    logger.error("Failed to install git hooks for existing repositories", {
      error,
    });
    // Don't throw - this shouldn't prevent app startup
  }
}

/**
 * Deletes a git repository for an integration
 * @param integrationId - The unique identifier for the integration
 */
export async function deleteIntegrationGitRepo(
  integrationId: string,
): Promise<void> {
  try {
    const gitRepoPath = getIntegrationGitPath(integrationId);
    await fs.rm(gitRepoPath, { recursive: true, force: true });
    const { logger } = getGlobals();
    await logger.logIntegrationOtherInfo(
      integrationId,
      `Deleted git repository at ${gitRepoPath}`,
    );
  } catch (error) {
    const { logger } = getGlobals();
    await logger.logIntegrationOtherError(
      integrationId,
      "Failed to delete git repository",
      { error },
    );
    logger.error(`Failed to delete git repository for ${integrationId}`, {
      error,
    });
    throw new Error(
      `Failed to delete git repository for integration ${integrationId}`,
    );
  }
}
