import fs from "fs/promises";
import path from "path";
import { updateTrigger } from "./updateTrigger";

export async function loadAllTriggers(internalDataFilePath: string) {
  const integrationCodePath = path.join(
    internalDataFilePath,
    "integration-code",
  );

  let ids: string[] = [];

  try {
    ids = (
      await fs.readdir(integrationCodePath, {
        withFileTypes: true,
      })
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.basename(dirent.name, ".git"));
    console.log("Found existing repos:", ids);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(
        "Integration code directory does not exist, no triggers to load",
      );
    } else {
      throw error;
    }
  }

  return Promise.all(ids.map((id) => updateTrigger(id, integrationCodePath)));
}
