export interface IntegrationPodGlobals {
  rootFilePath: string;
  internalDataFilePath: string;
  integrationCodePath: string;
  integrationMetaPath: string;
  integrationGitPath: string;
}

const globals: IntegrationPodGlobals = {
  rootFilePath: "",
  internalDataFilePath: "",
  integrationCodePath: "",
  integrationMetaPath: "",
  integrationGitPath: "",
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: IntegrationPodGlobals) {
  Object.assign(globals, givenGlobals);
}
