import { HttpHandler, HttpHandlerInput } from "@solid/community-server";
import { Express, response } from "express";
import { createApp } from "./createApp";

export interface IntegrationHandlerArgs {
  baseUrl?: string;
}

/**
 * Handles any request to a integration route
 */
export class IntegrationHandler extends HttpHandler {
  private app: Express | null = null;

  constructor(baseUrl: string) {
    super();
    this.initializeApp(baseUrl);
  }

  private async initializeApp(baseUrl: string): Promise<void> {
    this.app = await createApp(baseUrl);
  }

  async handle(input: HttpHandlerInput): Promise<void> {
    if (!this.app) {
      throw new Error("App not initialized");
    }

    return new Promise((resolve, reject) => {
      response.on("finish", resolve); // success
      response.on("close", resolve); // e.g. client aborted
      response.on("error", reject); // error sending response

      // Trigger the app
      this.app!(input.request, input.response);
    });
  }
}
