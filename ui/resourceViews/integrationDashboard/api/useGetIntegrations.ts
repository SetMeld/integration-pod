import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { callApi } from "./callApi";
import { useSolidAuth } from "@ldo/solid-react";

export function useGetIntegrations(): () => Promise<IntegrationInformation[]> {
  const { fetch } = useSolidAuth();
  
  return async () => {
    return callApi<IntegrationInformation[]>(
      fetch,
      "/integration",
      "json",
      "GET",
    );
  }
}