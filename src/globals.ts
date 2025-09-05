import { Logger } from "./util/logger";

export interface IntegrationPodGlobals {
  baseUrl: string;
  rootFilePath: string;
  internalDataFilePath: string;
  integrationCodePath: string;
  integrationMetaPath: string;
  integrationGitPath: string;
  gitUri: string;
  logger: Logger;
}

const globals: IntegrationPodGlobals = {
  baseUrl: "",
  rootFilePath: "",
  internalDataFilePath: "",
  integrationCodePath: "",
  integrationMetaPath: "",
  integrationGitPath: "",
  gitUri: "",
  logger: new Logger(),
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: Partial<IntegrationPodGlobals>) {
  Object.assign(globals, givenGlobals);
}
