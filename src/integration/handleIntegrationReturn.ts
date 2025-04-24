import path from "path";
import fs from "fs/promises";
import {
  IntegrationReturn,
  ResourceUpdateInformation,
  ContainerUpdateInformation,
} from "./IntegrationReturn";
import { Express } from "express";
import { HttpError } from "../api/HttpError";

type MulterFile = Express.Multer.File;

const BASE_PATH = "/app/data";

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function handleIntegrationReturn(
  integrationReturn: IntegrationReturn,
): Promise<void> {
  for (const item of integrationReturn.files) {
    await processItem(item, BASE_PATH);
  }
}

async function processItem(
  item: ResourceUpdateInformation | ContainerUpdateInformation,
  currentPath: string,
): Promise<void> {
  const fullPath = path.join(currentPath, item.path);

  // Handle overwrite
  if (item.overwrite && (await exists(fullPath))) {
    if (item.type === "container") {
      await fs.rm(fullPath, { recursive: true, force: true });
    } else if (item.type === "resource") {
      await fs.unlink(fullPath);
    }
  }

  if (item.type === "container") {
    await fs.mkdir(fullPath, { recursive: true });

    // Recursively handle contents
    if (item.contains) {
      for (const containedItem of item.contains) {
        await processItem(containedItem, fullPath);
      }
    }
  } else if (item.type === "resource") {
    let data;
    if (typeof item.data === "string") {
      data = item.data;
    } else if (item.data.buffer) {
      data = item.data.buffer;
    } else if (item.data.path) {
      data = await fs.readFile(item.data.path);
    } else {
      throw new HttpError(400, "Unsupported data format in resource");
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
  }
}
