import { IntegrationInformation } from "../../../common/IntegrationInformation";
import { callApi } from "./callApi";
import { useSolidAuth } from "@ldo/solid-react";

export function useGetIntegration(): (
  id: string
) => Promise<IntegrationInformation> {
    const { fetch } = useSolidAuth();

  return async (id: string): Promise<IntegrationInformation> => {
    return callApi<IntegrationInformation>(
      fetch,
      `/integration/${id}`,
      "json",
      "GET",
    );
  }
}
