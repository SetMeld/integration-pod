import { Logger } from "./util/logger";

export interface IntegrationPodGlobals {
  rootFilePath: string;
  internalDataFilePath: string;
  integrationCodePath: string;
  integrationMetaPath: string;
  integrationGitPath: string;
  logger: Logger;
}

const globals: IntegrationPodGlobals = {
  rootFilePath: "",
  internalDataFilePath: "",
  integrationCodePath: "",
  integrationMetaPath: "",
  integrationGitPath: "",
  logger: new Logger(),
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: Partial<IntegrationPodGlobals>) {
  Object.assign(globals, givenGlobals);
}
