// Handles files in `/.integration/`
import fs from "fs/promises";
import path from "path";
import { fsExists } from "../util/fsExits";
import { getGlobals } from "../globals";

export async function ensureIntegrationFolder(): Promise<void> {
  const { rootFilePath } = getGlobals();
  const integrationFolderPath = path.join(rootFilePath, ".integration");
  const aclFilePath = path.join(integrationFolderPath, ".acl");

  try {
    // Check if .integration folder exists
    if (!(await fsExists(integrationFolderPath))) {
      await fs.mkdir(integrationFolderPath, { recursive: true });
    }

    // Check if .acl file exists, if not create it
    if (!(await fsExists(aclFilePath))) {
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
      await writeAclFile(aclFilePath, aclContent);
    }
  } catch (error) {
    console.error("Error creating .integration folder or .acl file:", error);
  }
}

export async function writeAclFile(
  aclFilePath: string,
  aclContent: string,
): Promise<void> {
  await fs.writeFile(aclFilePath, aclContent);
}
