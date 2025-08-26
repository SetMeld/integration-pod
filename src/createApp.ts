import express, { Express } from "express";
import { createApiRouter } from "./api/apiRouter";
import path from "path";
import { loadAllTriggers } from "./triggers/loadAllTriggers";
import { setGlobals } from "./globals";
import { exists } from "./integration/util/exits";
import fs from "fs/promises";

export function createApp(base: string, rootFilePath: string): Express {
  const app = express();

  const internalDataFilePath = path.join(rootFilePath, ".internal");
  const integrationCodePath = path.join(
    internalDataFilePath,
    "integration-code",
  );

  setGlobals({
    rootFilePath,
    internalDataFilePath,
    integrationCodePath,
  });

  ensureIntegrationFolder(rootFilePath);

  const apiRouter = createApiRouter(base);

  app.use("/.integration/api", apiRouter);

  const uiPath = path.resolve(__dirname, "ui");
  app.use("/.integration", express.static(uiPath));

  app.get(new RegExp("^/\\.integration/.*"), (req, res) => {
    res.sendFile(path.join(uiPath, "index.html"));
  });

  loadAllTriggers(internalDataFilePath);

  return app;
}

export function ensureIntegrationFolder(rootFilePath: string) {
  // Check and create .integration folder with .acl file
  const integrationFolderPath = path.join(rootFilePath, ".integration");
  const aclFilePath = path.join(integrationFolderPath, ".acl");

  // Ensure .integration folder exists and has .acl file
  (async () => {
    try {
      // Check if .integration folder exists
      if (!(await exists(integrationFolderPath))) {
        await fs.mkdir(integrationFolderPath, { recursive: true });
      }

      // Check if .acl file exists, if not create it
      if (!(await exists(aclFilePath))) {
        const aclContent = `# Root ACL resource for the agent account
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

# The homepage is readable by the public
<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./>;
    acl:mode acl:Read.

# The owner has full access to every resource in their pod.
# Other agents have no access rights,
# unless specifically authorized in other .acl resources.
<#owner>
    a acl:Authorization;
    acl:agent <http://localhost:3000/admin/profile/card#me>;
    # Optional owner email, to be used for account recovery:
    
    # Set the access to the root storage folder itself
    acl:accessTo <./>;
    # All resources will inherit this authorization, by default
    acl:default <./>;
    # The owner has all of the access modes allowed
    acl:mode
        acl:Read, acl:Write, acl:Control.
`;
        await fs.writeFile(aclFilePath, aclContent);
      }
    } catch (error) {
      console.error("Error creating .integration folder or .acl file:", error);
    }
  })();
}
