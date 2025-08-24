export type IntegrationStatus =
  | { type: "ok" }
  | { type: "error"; message: string };

export interface IntegrationInformation {
  id: string;
  name: string;
  displayName: string;
  targetFile: string;
  gitAddress: string;
  status: IntegrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIntegrationRequest {
  name: string;
  displayName?: string;
  targetFile?: string;
}

export type UpdateableIntegrationInformation = Pick<
  IntegrationInformation,
  "name" | "targetFile"
>;

export type LogTypes = "deploy" | "trigger" | "integration";
