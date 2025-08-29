// Handles files in `/.internal/integration-meta/`

import fs from "fs/promises";
import path from "path";
import { getGlobals } from "../globals";

export type IntegrationStatus =
  | { type: "ok" }
  | { type: "error"; message: string };

export interface IntegrationMeta {
  id: string;
  name: string;
  targetFile: string;
  gitAddress: string;
  status: IntegrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type LogTypes = "deploy" | "trigger" | "integration";

/**
 * Saves integration meta data to a JSON file
 * @param integrationMeta - The integration meta data to save
 */
export async function saveIntegrationMeta(
  integrationMeta: IntegrationMeta,
): Promise<void> {
  const { integrationMetaPath } = getGlobals();
  const metaFilePath = path.join(
    integrationMetaPath,
    `${integrationMeta.id}.json`,
  );

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(path.dirname(metaFilePath), { recursive: true });

    // Save the meta data as JSON
    await fs.writeFile(metaFilePath, JSON.stringify(integrationMeta, null, 2));

    console.log(
      `[${integrationMeta.id}] Saved integration meta to ${metaFilePath}`,
    );
  } catch (error) {
    console.error(
      `[${integrationMeta.id}] Failed to save integration meta:`,
      error,
    );
    throw new Error(
      `Failed to save integration meta for ${integrationMeta.id}`,
    );
  }
}

/**
 * Reads integration meta data from a JSON file
 * @param integrationId - The unique identifier for the integration
 * @returns The integration meta data
 */
export async function readIntegrationMeta(
  integrationId: string,
): Promise<IntegrationMeta> {
  const { integrationMetaPath } = getGlobals();
  const metaFilePath = path.join(integrationMetaPath, `${integrationId}.json`);

  try {
    const metaData = await fs.readFile(metaFilePath, "utf-8");
    return JSON.parse(metaData) as IntegrationMeta;
  } catch (error) {
    console.error(`[${integrationId}] Failed to read integration meta:`, error);
    throw new Error(`Failed to read integration meta for ${integrationId}`);
  }
}

/**
 * Lists all integration meta files
 * @returns Array of integration IDs
 */
export async function listIntegrationMeta(): Promise<string[]> {
  const { integrationMetaPath } = getGlobals();

  try {
    const files = await fs.readdir(integrationMetaPath);
    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""));
  } catch (error) {
    console.error("Failed to list integration meta files:", error);
    return [];
  }
}

/**
 * Checks if integration meta exists
 * @param integrationId - The unique identifier for the integration
 * @returns True if the meta file exists, false otherwise
 */
export async function integrationMetaExists(
  integrationId: string,
): Promise<boolean> {
  try {
    await readIntegrationMeta(integrationId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes integration meta data
 * @param integrationId - The unique identifier for the integration
 */
export async function deleteIntegrationMeta(
  integrationId: string,
): Promise<void> {
  const { integrationMetaPath } = getGlobals();
  const metaFilePath = path.join(integrationMetaPath, `${integrationId}.json`);

  try {
    await fs.unlink(metaFilePath);
    console.log(
      `[${integrationId}] Deleted integration meta at ${metaFilePath}`,
    );
  } catch (error) {
    console.error(
      `[${integrationId}] Failed to delete integration meta:`,
      error,
    );
    throw new Error(`Failed to delete integration meta for ${integrationId}`);
  }
}
