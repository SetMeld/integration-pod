import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useCallback, useState } from "react";
import { useSetGitSshKey } from "../../api/useSetGitSshKey";
import toast from "react-hot-toast";

export default function SshKeyForm() {
  const [sshKey, setSshKey] = useState("");
  const setGitSshKey = useSetGitSshKey();

  const onSubmit = useCallback(async () => {
    await setGitSshKey(sshKey);
    toast("Ssh Key Updated");
  }, [sshKey]);

  return (
    <div>
      <PageMeta
        title="Set SSH Key"
        description="Set an SSH key to access your integration/"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
        <ComponentCard title="Set your GIT SSH Public Key">
          <div className="space-y-6">
            <p>Copy and paste the public key used by git here. This key can be used to push code to the integration server.</p>
            <div>
              <Label htmlFor="input">SSH Key</Label>
              <Input type="text" id="input" value={sshKey} onChange={(e) => setSshKey(e.target.value.trim())} />
            </div>
            <Button onClick={onSubmit}>Update SSH Key</Button>
          </div>
        </ComponentCard>
        </div>
      </div>
    </div>
  );
}
