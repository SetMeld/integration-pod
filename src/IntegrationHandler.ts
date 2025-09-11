import { HttpHandler, HttpHandlerInput } from "@solid/community-server";
import { Express, response } from "express";
import { getLoggerFor } from "global-logger-factory";
import { createApp } from "./createApp";

/**
 * Handles any request to a integration route
 */
export class IntegrationHandler extends HttpHandler {
  private app: Express;
  protected readonly logger = getLoggerFor(this);

  constructor(baseUrl: string, rootFilePath: string, gitUri: string) {
    super();

    this.app = createApp(baseUrl, rootFilePath, gitUri);
  }

  async handle(input: HttpHandlerInput): Promise<void> {
    return new Promise((resolve, reject) => {
      response.on("finish", resolve); // success
      response.on("close", resolve); // e.g. client aborted
      response.on("error", reject); // error sending response

      // Trigger the app
      this.app(input.request, input.response);
    });
  }
}
