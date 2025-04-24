import fs from "fs/promises";
import path from "path";
import { updateTrigger } from "./updateTrigger";

export async function loadAllTriggers() {
  const ids = (await fs.readdir("/app/integrations/", { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.basename(dirent.name, ".git"));
  console.log("Found existing repos:", ids);

  return Promise.all(ids.map((id) => updateTrigger(id)));
}
