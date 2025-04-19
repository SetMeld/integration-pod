import { IntegrationInformation } from "../../../common/IntegrationInformation";

export function useGetIntegrations(): () => Promise<IntegrationInformation[]> {
  return async () => {
    return [
      {
        id: "1",
        name: "Some Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          "type": "ok"
        }
      },
      {
        id: "2",
        name: "Another Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          "type": "ok"
        }
      },
      {
        id: "3",
        name: "Hello Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          "type": "error",
          "message": "There was some kind of error here. I don't like it."
        }
      },
      {
        id: "4",
        name: "Weehee Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          "type": "ok"
        }
      },
      {
        id: "5",
        name: "My cool Integration",
        targetFile: "/path/to/file/",
        gitAddress: "@git:example",
        status: {
          "type": "ok"
        }
      },
    ]
  }
}