import { HttpError } from "@solid/community-server";
import { AccountChanges } from "../IntegrationResponse";
import { fsExists } from "../../../util/fsExits";
import path from "path";
import { getGlobals } from "../../../globals";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SERVER_URL = "http://localhost:3000/.account/";
const BASE_PATH = "/app/data";

export async function processAccount(
  accountChanges: AccountChanges,
): Promise<void> {
  const { logger } = getGlobals();
  logger.info("Processing account changes", { accountChanges });
  const { podName, overwrite = false, externalWebId } = accountChanges;

  // Step 0: Check if the Pod exists, if it does, don't do anything.
  if (await fsExists(path.join(BASE_PATH, podName))) {
    return;
  }

  // Step 1: Fetch the controls
  const controlsResponse = await fetch(SERVER_URL, {
    method: "GET",
  });
  const controlsData = (await controlsResponse.json()) as any;
  logger.debug("Controls data", { controlsData });
  const createAccountUrl = controlsData?.controls?.account?.create;
  if (!createAccountUrl) throw new Error("Create Account url not found.");

  // Step 2: Create an account
  const createAccountResponse = await fetch(createAccountUrl, {
    method: "POST",
  });
  const createAccountData = (await createAccountResponse.json()) as any;
  logger.debug("Create account data", { createAccountData });

  const authorization = createAccountData.authorization;

  const controlsResponseAuth = await fetch(SERVER_URL, {
    headers: { authorization: `CSS-Account-Token ${authorization}` },
  });
  const controlsDataAuth = (await controlsResponseAuth.json()) as any;
  logger.debug("Controls data auth", { controlsDataAuth });

  // Step 3: Create a Password
  const createPasswordUri = controlsDataAuth.controls.password.create;

  const createPasswordResponse = await fetch(createPasswordUri, {
    method: "POST",
    headers: {
      authorization: `CSS-Account-Token ${authorization}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: accountChanges.account.email,
      password: accountChanges.account.password,
    }),
  });
  if (
    createPasswordResponse.status < 200 ||
    createPasswordResponse.status >= 300
  ) {
    throw new HttpError(400, "Could not create new account");
  }
  const createPasswordResult = (await createPasswordResponse.json()) as any;
  logger.debug("Create password result", { createPasswordResult });

  // Step 4: Create the Pod
  const createPodUrl = createPasswordResult.controls.account.pod;
  const createPodResponse = await fetch(createPodUrl, {
    method: "POST",
    headers: {
      authorization: `CSS-Account-Token ${authorization}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: accountChanges.podName,
    }),
  });
  const createPodResult = (await createPodResponse.json()) as any;
  logger.debug("Create pod result", { createPodResult });

  // const existingPods: Record<string, string> = loginUrlData?.pods ?? {};

  // const foundPodEntry = Object.entries(existingPods).find(([podBaseUrl]) =>
  //   podBaseUrl.endsWith(`/${podName}/`),
  // );

  // // Step 3: Handle overwrite
  // if (foundPodEntry) {
  //   if (!overwrite) {
  //     console.log(`Pod "${podName}" already exists. Skipping creation.`);
  //     return;
  //   } else {
  //     const podResourceUrl = foundPodEntry[1];
  //     console.log(`Overwriting pod "${podName}". Deleting...`);
  //     await fetch(podResourceUrl, {
  //       method: "DELETE",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     // We might also need to delete linked WebIDs if they exist (omitted here for brevity)
  //   }
  // }

  // // Step 4: Create the new Pod
  // console.log(`Creating pod "${podName}"...`);
  // const createBody: any = { podName };
  // if (externalWebId) {
  //   createBody.settings = { webId: externalWebId };
  // }

  // const createPodResponse = await fetch(createUrl, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(createBody),
  // });

  // if (!createPodResponse.ok) {
  //   const errorText = await createPodResponse.text();
  //   throw new Error(`Failed to create pod: ${errorText}`);
  // }

  // console.log(`Pod "${podName}" created successfully.`);
}
