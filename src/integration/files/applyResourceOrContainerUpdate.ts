import { HttpError } from "../../api/HttpError";
import {
  ContainerUpdateInformation,
  ResourceUpdateInformation,
} from "../IntegrationReturn";
import fs from "fs/promises";
import path from "path";
import { exists } from "../util/exits";

/**
 * Given the update a resource or container update, apply it to the file system.
 * @param item - The file or container update information.
 * @param currentPath - The current path to the file or container.
 */
export async function applyResourceOrContainerUpdate(
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
        await applyResourceOrContainerUpdate(containedItem, fullPath);
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
