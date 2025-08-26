export interface IntegrationPodGlobals {
  rootFilePath: string;
  internalDataFilePath: string;
  integrationCodePath: string;
}

const globals: IntegrationPodGlobals = {
  rootFilePath: "",
  internalDataFilePath: "",
  integrationCodePath: "",
};

export function getGlobals(): IntegrationPodGlobals {
  return globals;
}

export function setGlobals(givenGlobals: IntegrationPodGlobals) {
  Object.assign(globals, givenGlobals);
}
