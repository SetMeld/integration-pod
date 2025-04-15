import { HttpHandler, HttpHandlerInput } from "@solid/community-server";

/**
 * Handles any request to a integration route
 */
export class IntegrationHandler extends HttpHandler {
  handle(input: HttpHandlerInput): Promise<void> {
    console.log(input);
    throw new Error("Method noßt implemented.");
  }
}
