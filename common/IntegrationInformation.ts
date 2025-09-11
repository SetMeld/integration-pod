export type IntegrationStatus =
  | { type: "ok" }
  | { type: "error"; message: string };

export interface IntegrationInformation {
  id: string;
  name: string;
  gitAddress: string;
  status: IntegrationStatus;
}

export type UpdateableIntegrationInformation = Pick<
  IntegrationInformation,
  "name"
>;

export type LogTypes = "deploy" | "trigger" | "integration";
