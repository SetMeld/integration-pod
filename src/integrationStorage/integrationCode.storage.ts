// Handles files in `/.internal/integration-code/`
import fs from "fs/promises";
import path from "path";
import { getGlobals } from "../globals";
export interface IntegrationConfig {
  trigger: {
    type: string;
  };
}

export async function readPackageJson(id: string): Promise<{ main: string }> {
  const { integrationCodePath } = getGlobals();
  const integrationPath = path.join(integrationCodePath, id);
  const packageJsonPath = path.join(integrationPath, "package.json");
  const packageJsonRaw = await fs.readFile(packageJsonPath, "utf-8");
  const { main } = JSON.parse(packageJsonRaw);

  if (!main) {
    throw new Error(`No "main" field found in ${packageJsonPath}`);
  }

  return { main };
}

export async function readIntegrationConfig(
  id: string,
): Promise<IntegrationConfig> {
  const { integrationCodePath } = getGlobals();
  const integrationJsonPath = path.join(
    integrationCodePath,
    id,
    "integration.json",
  );
  const integrationDataRaw = await fs.readFile(integrationJsonPath, "utf-8");
  return JSON.parse(integrationDataRaw);
}

export async function listIntegrationIds(): Promise<string[]> {
  const { integrationCodePath } = getGlobals();
  try {
    const entries = await fs.readdir(integrationCodePath, {
      withFileTypes: true,
    });

    return entries
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.basename(dirent.name, ".git"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export function getIntegrationPath(id: string): string {
  const { integrationCodePath } = getGlobals();
  return path.join(integrationCodePath, id);
}

export async function removeIntegration(id: string): Promise<void> {
  const integrationPath = getIntegrationPath(id);
  await fs.rm(integrationPath, { recursive: true, force: true });
}
