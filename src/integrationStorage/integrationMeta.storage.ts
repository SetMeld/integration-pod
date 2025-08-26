// Handles files in `/.internal/integration-meta/`

export type IntegrationStatus =
  | { type: "ok" }
  | { type: "error"; message: string };

export interface IntegrationMeta {
  id: string;
  name: string;
  displayName: string;
  targetFile: string;
  gitAddress: string;
  status: IntegrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type LogTypes = "deploy" | "trigger" | "integration";
