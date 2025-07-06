import { IntegrationInformation, UpdateableIntegrationInformation } from "../../../../common/IntegrationInformation";
import { callApi } from "./callApi";
import { useSolidAuth } from "@ldo/solid-react";

export function useUpdateIntegration(): (
  id: string,
  info: UpdateableIntegrationInformation
) => Promise<IntegrationInformation> {
  const { fetch } = useSolidAuth();

  return (
    id: string,
    info: UpdateableIntegrationInformation
  ): Promise<IntegrationInformation> => {
    return callApi<IntegrationInformation>(
      fetch,
      `/integration/${id}`,
      "json",
      "PUT",
      JSON.stringify(info)
    );
  }
}
