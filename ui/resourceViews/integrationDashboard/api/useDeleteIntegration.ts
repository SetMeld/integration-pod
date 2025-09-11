import { useSolidAuth } from "@ldo/solid-react";
import { callApi } from "./callApi";

export function useDeleteIntegration(): (id: string) => Promise<void> {
  const { fetch } = useSolidAuth();

  return async (id: string): Promise<void> => {
    return callApi<void>(
      fetch,
      `/integration/${id}`,
      "none",
      "DELETE",
    );
  };
}