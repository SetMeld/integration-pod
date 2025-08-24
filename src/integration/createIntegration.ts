import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import {
  IntegrationInformation,
  CreateIntegrationRequest,
} from "../../common/IntegrationInformation";
import { HttpError } from "../api/HttpError";
import { TemplateService, TemplateData } from "./util/templateService";
import { createIntegrationLogger } from "../utils/logger";

const execAsync = promisify(exec);

export async function createIntegration(
  request: CreateIntegrationRequest,
): Promise<IntegrationInformation> {
  console.log("createIntegration", request);
  const {
    name,
    displayName = name,
    targetFile = `/integration-data/${name}.ttl`,
  } = request;

  // Validate integration name
  if (!name || name.trim() === "") {
    throw new HttpError(400, "Integration name is required");
  }

  // Check for invalid characters in name (for folder/file safety)
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new HttpError(
      400,
      "Integration name can only contain letters, numbers, underscores, and hyphens",
    );
  }

  const integrationId = name;
  const logger = createIntegrationLogger(integrationId);

  try {
    // Check if integration already exists
    const integrationMetaPath = path.join(
      "/app/integrations-meta",
      integrationId,
    );
    const integrationPath = path.join("/app/integrations", integrationId);
    const reposPath = path.join("/srv/git", integrationId);

    // Check if any of the directories already exist
    try {
      await fs.access(integrationMetaPath);
      throw new HttpError(
        409,
        `Integration with name "${name}" already exists`,
      );
    } catch (error) {
      if (error instanceof HttpError) throw error;
      // Directory doesn't exist, which is what we want
    }

    try {
      await fs.access(integrationPath);
      throw new HttpError(
        409,
        `Integration with name "${name}" already exists`,
      );
    } catch (error) {
      if (error instanceof HttpError) throw error;
      // Directory doesn't exist, which is what we want
    }

    try {
      await fs.access(reposPath);
      throw new HttpError(
        409,
        `Integration with name "${name}" already exists`,
      );
    } catch (error) {
      if (error instanceof HttpError) throw error;
      // Directory doesn't exist, which is what we want
    }

    // Create directories
    await fs.mkdir(integrationMetaPath, { recursive: true });
    await fs.mkdir(integrationPath, { recursive: true });
    await fs.mkdir(reposPath, { recursive: true });

    // Initialize git repository
    try {
      await execAsync("git init", { cwd: reposPath });
      logger.info("Initialized git repository", { reposPath });
    } catch (error) {
      logger.error("Failed to initialize git repository", { reposPath, error });
      // Clean up created directories
      await fs.rm(integrationMetaPath, { recursive: true, force: true });
      await fs.rm(integrationPath, { recursive: true, force: true });
      await fs.rm(reposPath, { recursive: true, force: true });
      throw new HttpError(500, "Failed to initialize git repository");
    }

    // Create metadata file
    const metadata: IntegrationInformation = {
      id: integrationId,
      name: integrationId,
      displayName,
      targetFile,
      gitAddress: `ssh://localhost:2222/srv/git/${integrationId}.git`,
      status: {
        type: "ok",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const metadataPath = path.join(integrationPath, "metadata.json");
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Initialize template service and copy all templates
    const templateService = new TemplateService(undefined, integrationId);
    const templateData: TemplateData = {
      integrationId,
      displayName,
      targetFile,
      createdAt: new Date().toISOString(),
    };

    // Copy all templates from the integration template folder
    await templateService.copyAllTemplates(integrationPath, templateData);

    return metadata;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error("Error creating integration", { error });
    throw new HttpError(500, "Failed to create integration");
  }
}
