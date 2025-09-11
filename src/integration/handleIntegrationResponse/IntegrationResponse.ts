import { WacRule } from "@ldo/connected-solid";

export interface ContainerUpdateInformation {
  type: "container";
  overwrite?: boolean;
  path: string;
  contains?: (ResourceUpdateInformation | ContainerUpdateInformation)[];
  wac?: WacRule;
}

export interface ResourceUpdateInformation {
  type: "resource";
  overwrite?: boolean;
  path: string;
  wac?: WacRule;
  data: string | Express.Multer.File;
}

export interface AccountChanges {
  overwrite?: boolean;
  podName: string;
  account: {
    email: string;
    password: string;
  };
  externalWebId?: string;
}

export interface IntegrationResponse {
  files?: (ResourceUpdateInformation | ContainerUpdateInformation)[];
  accounts?: AccountChanges[];
}
