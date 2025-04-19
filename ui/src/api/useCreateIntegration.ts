import { IntegrationInformation } from "../../../common/IntegrationInformation";

export function useCreateIntegration():
  (name: string) => Promise<IntegrationInformation> {
  return async (name: string) => {
    return {
      id: "6",
      name: name,
      targetFile: "/path/to/file/",
      gitAddress: "@git:example",
      status: {
        "type": "ok"
      }
    };
  }
}