import { IntegrationInformation } from "../../../common/IntegrationInformation";

export function useGetIntegration():
  (id: string) => Promise<IntegrationInformation> {

  return async (id: string): Promise<IntegrationInformation> => {
    return {
      id: "5",
      name: "My cool Integration",
      targetFile: "/path/to/file/",
      gitAddress: "@git:example",
      status: {
        "type": "ok"
      }
    };
  }
}
