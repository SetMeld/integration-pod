import { IntegrationInformation, LogTypes } from "../../../common/IntegrationInformation";

export function useGetLogs(): (
  id: string,
  logType: LogTypes
) => Promise<string> {

  return async (
    id: string,
    logType: LogTypes
  ): Promise<string> => {
    return "Log example"
  };
}