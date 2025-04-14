import * as path from "path";
import type { App } from "@solid/community-server";
import { AppRunner, resolveModulePath } from "@solid/community-server";
import "jest-rdf";

export const SERVER_DOMAIN = process.env.SERVER || "http://localhost:3001/";
export const ROOT_ROUTE = process.env.ROOT_CONTAINER || "";
export const ROOT_CONTAINER = `${SERVER_DOMAIN}${ROOT_ROUTE}`;
export const WEB_ID =
  process.env.WEB_ID || `${SERVER_DOMAIN}example/profile/card#me`;

export async function createApp(customConfigPath?: string): Promise<App> {
  if (process.env.SERVER) {
    return {
      start: () => {},
      stop: () => {},
    } as App;
  }
  const appRunner = new AppRunner();

  return appRunner.create({
    loaderProperties: {
      mainModulePath: resolveModulePath(""),
      typeChecking: false,
    },
    config: customConfigPath ?? resolveModulePath("config/file-root.json"),
    variableBindings: {},
    shorthand: {
      port: 3_001,
      loggingLevel: "off",
      seedConfig: path.join(__dirname, "configs", "solid-css-seed.json"),
      rootFilePath: path.join(__dirname, "./data"),
    },
  });
}
