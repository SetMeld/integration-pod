import toast from "react-hot-toast";



export async function callApi<ReturnType>(
  authFetch: typeof fetch,
  path: string,
  returnType: "string" | "json",
  method: RequestInit["method"],
  body?: string
): Promise<ReturnType> {
  const origin = window.location.origin;
  const result = await authFetch(`${origin}/.integration/api${path}`, {
    method,
    body,
  });
  if (result.status < 200 || result.status >= 300) {
    const errMessage = await result.text();
    toast.error(errMessage);
    throw new Error(errMessage);
  }
  const parsedData: ReturnType = returnType === "json" ?
    await result.json() :
    await result.text() as ReturnType;

  return parsedData;
}