import { LogTypes } from "../../../common/IntegrationInformation";
import { callApi } from "./callApi";
import { useSolidAuth } from "@ldo/solid-react";

export function useGetLogs(): (
  id: string,
  logType: LogTypes
) => Promise<string> {
  const { fetch } = useSolidAuth();

  return async (
    id: string,
    logType: LogTypes
  ): Promise<string> => {
    return callApi<string>(
      fetch,
      `/integration/${id}/logs/${logType}`,
      "string",
      "GET",
    );
  };
}