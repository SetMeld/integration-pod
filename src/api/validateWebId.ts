import type { Request, RequestHandler, Response, NextFunction } from "express";
import type {
  RequestMethod,
  SolidTokenVerifierFunction,
} from "@solid/access-token-verifier";
import { createSolidTokenVerifier } from "@solid/access-token-verifier";
import { HttpError } from "./HttpError";

const solidOidcAccessTokenVerifier: SolidTokenVerifierFunction =
  createSolidTokenVerifier();

export function createValidateWebId(base: string) {
  const validateWebId: RequestHandler = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { webid: webId } = await solidOidcAccessTokenVerifier(
        request.headers["authorization"] as string,
        {
          header: request.headers["dpop"] as string,
          method: request.method as RequestMethod,
          url:
            request.protocol +
            "://" +
            request.get("host") +
            request.originalUrl,
        },
      );

      // TODO check if WebID is the single right WebId.
      const expectedWebId = `${base}profile/card#me`;
      if (expectedWebId === webId) {
        next();
      } else {
        throw new HttpError(403, "Not authorized.");
      }
    } catch (error: unknown) {
      const message = `Error verifying Access Token via WebID: ${(error as Error).message}`;

      throw new HttpError(401, message);
    }
  };
  return validateWebId;
}
