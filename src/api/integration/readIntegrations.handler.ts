import { RequestHandler } from "express";
import { HttpError } from "../HttpError";
import { IntegrationMeta } from "../../integrationStorage/integrationMeta.storage";
import {
  listIntegrationMeta,
  readIntegrationMeta,
} from "../../integrationStorage/integrationMeta.storage";
import { getGlobals } from "../../globals";
import { getIntegrationGitSshUrl } from "../../integrationStorage/integrationGit.storage";

/**
 * Reads all integrations from storage
 * @param req - Express request object
 * @param res - Express response object
 */
export const readIntegrationsHandler: RequestHandler = async (req, res) => {
  const { logger } = getGlobals();
  try {
    // Get list of all integration IDs
    const integrationIds = await listIntegrationMeta();

    // Read meta data for each integration
    const integrations: IntegrationMeta[] = [];

    for (const integrationId of integrationIds) {
      try {
        const integrationMeta = await readIntegrationMeta(integrationId);
        // Add the calculated git address
        const integrationWithGitAddress = {
          ...integrationMeta,
          gitAddress: getIntegrationGitSshUrl(integrationId),
        };
        integrations.push(integrationWithGitAddress);
      } catch (error) {
        logger.error(`Failed to read integration meta for ${integrationId}`, {
          error,
          integrationId,
        });
        // Continue with other integrations even if one fails
      }
    }

    logger.info(`Retrieved ${integrations.length} integrations`);

    // Return the integrations array
    res.json(integrations);
  } catch (error) {
    logger.error("Failed to read integrations", { error });

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Failed to read integrations");
  }
};
