import { useSolidAuth } from "@ldo/solid-react";
import { callApi } from "./callApi";

export function useSetGitSshKey(): (sshKey: string) => Promise<void> {
  const { fetch } = useSolidAuth();

  return async (sshKey: string): Promise<void> => {
    return callApi<void>(
      fetch,
      "/git-ssh-key",
      "none",
      "POST",
      JSON.stringify({ sshKey })
    );
  };
}
