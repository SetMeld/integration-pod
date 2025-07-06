import { Notifier } from 'react-native-notifier';

export async function callApi<ReturnType>(
  authFetch: typeof fetch,
  path: string,
  returnType: "string" | "json" | "none",
  method: RequestInit["method"],
  body?: string
): Promise<ReturnType> {
  const origin = window.location.origin;
  const init: RequestInit = {
    method,
    body,
  }
  if (init.body) {
    init.headers = {
      "content-type": "application/json"
    };
  }
  const result = await authFetch(`${origin}/.integration/api${path}`, init);
  if (result.status < 200 || result.status >= 300) {
    const errMessage = await result.text();
    Notifier.showNotification({ title: errMessage });
    throw new Error(errMessage);
  }
  const parsedData: ReturnType = returnType === "none" ? undefined
    : returnType === "json"
    ? await result.json()
    : await result.text() as ReturnType;

  return parsedData;
}