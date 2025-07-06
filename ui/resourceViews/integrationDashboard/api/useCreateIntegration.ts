import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { callApi } from "./callApi";
import { useSolidAuth } from "@ldo/solid-react";

export function useCreateIntegration(): (
  name: string
) => Promise<IntegrationInformation> {
  const { fetch } = useSolidAuth();

  return async (name: string) => {
    return callApi<IntegrationInformation>(
      fetch,
      "/integration",
      "json",
      "POST",
      JSON.stringify({ name })
    );
  }
}