// Handles files in `/.internal/integration-git/`

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { getGlobals } from "../globals";

const execAsync = promisify(exec);

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

  // Check if we're in development mode by looking for localhost in gitUri
  const isDevMode = gitUri.includes("localhost");

  if (isDevMode) {
    // In dev mode, use the full path to the repository
    return `${gitUri}/${integrationGitPath}/${integrationId}.git`;
  } else {
    // In production mode, use just the integration ID
    return `${gitUri}/${integrationId}.git`;
  }
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
