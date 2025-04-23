import { HttpError } from "../api/HttpError";
import { runIntegration } from "../integration/runIntegration";
import { Trigger } from "./Trigger";
import { Request, Response } from "express";

export interface WebhookTriggerConfig {
  type: "webhook";
  path: string;
  authKey: string;
  method: string;
}

export class WebhookTrigger implements Trigger<WebhookTriggerConfig> {
  // Record between
  private pathMapping: Record<
    string,
    [id: string, config: WebhookTriggerConfig]
  > = {};
  private idMapping: Record<string, WebhookTriggerConfig> = {};

  register(id: string, config: WebhookTriggerConfig): void {
    this.pathMapping[config.path] = [id, config];
    this.idMapping[id] = config;
  }

  unregister(id: string): void {
    const config = this.idMapping[id];
    if (config) {
      delete this.idMapping[id];
      delete this.pathMapping[config.path];
    }
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    // Get Path
    const base = req.baseUrl;
    const original = req.originalUrl;
    const subPath = original.slice(base.length) || "/";

    const pathMappingInfo = this.pathMapping[subPath];
    if (!pathMappingInfo || pathMappingInfo[1].method !== req.method) {
      throw new HttpError(404, "Webhook route not found.");
    }

    const [id, config] = pathMappingInfo;

    // Check to see if the auth key is valid
    if (req.headers.authorization === config.authKey) {
      throw new HttpError(401, "Webhook key is invalid.");
    }

    await runIntegration(id, "example data");

    res.send(`${config.type}, ${config.path} ${id}`);
    // TODO: run the integration
  }
}
