import { HttpHandler, HttpHandlerInput } from "@solid/community-server";
import { Express } from "express";
import { createApp } from "./createApp";

export interface IntegrationHandlerArgs {
  baseUrl?: string;
}

/**
 * Handles any request to a integration route
 */
export class IntegrationHandler extends HttpHandler {
  private app: Express;

  constructor(baseUrl: string) {
    super();

    console.log("BASE =============================================");
    console.log(baseUrl);

    this.app = createApp(baseUrl);
  }

  async handle(input: HttpHandlerInput): Promise<void> {
    this.app(input.request, input.response);
  }
}
