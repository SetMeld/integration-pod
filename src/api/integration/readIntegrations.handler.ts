import { RequestHandler } from "express";
import { HttpError } from "../HttpError";
import { IntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import {
  listIntegrationMeta,
  readIntegrationMeta,
} from "../../integrationStorage/integrationMeta.storage";

/**
 * Reads all integrations from storage
 * @param req - Express request object
 * @param res - Express response object
 */
export const readIntegrationsHandler: RequestHandler = async (req, res) => {
  try {
    // Get list of all integration IDs
    const integrationIds = await listIntegrationMeta();

    // Read meta data for each integration
    const integrations: IntegrationMeta[] = [];

    for (const integrationId of integrationIds) {
      try {
        const integrationMeta = await readIntegrationMeta(integrationId);
        integrations.push(integrationMeta);
      } catch (error) {
        console.error(
          `[${integrationId}] Failed to read integration meta:`,
          error,
        );
        // Continue with other integrations even if one fails
      }
    }

    console.log(`Retrieved ${integrations.length} integrations`);

    // Return the integrations array
    res.json(integrations);
  } catch (error) {
    console.error("Failed to read integrations:", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Failed to read integrations");
  }
};
