import { IntegrationMeta } from "../../integrationStorage/integrationMeta.storage";

export type UpdateableIntegrationMetaRequest = Pick<
  IntegrationMeta,
  "name" | "targetFile"
>;
