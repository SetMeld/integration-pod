import { IntegrationInformation, UpdateableIntegrationInformation } from "../../../common/IntegrationInformation";

export function useUpdateIntegration(): (
  id: string,
  info: UpdateableIntegrationInformation
) => Promise<IntegrationInformation> {

  return (
    id: string,
    info: UpdateableIntegrationInformation
  ): Promise<IntegrationInformation> => {
    throw new Error("Not Implemented");
  }
}
