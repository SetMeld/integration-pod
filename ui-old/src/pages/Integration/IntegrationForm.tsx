import { FunctionComponent, useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { IntegrationInformation, UpdateableIntegrationInformation } from "../../../../common/IntegrationInformation";
import Button from "../../components/ui/button/Button";
import { CopyIcon } from "../../icons";
import toast from "react-hot-toast";

export const IntegrationForm: FunctionComponent<{
  integration?: IntegrationInformation;
  onSubmit: (updated: UpdateableIntegrationInformation) => Promise<void>;
}> = ({ integration, onSubmit }) => {
  const [name, setName] = useState("");
  const [targetFile, setTargetFile] = useState("");

  useEffect(() => {
    if (integration) {
      setName(integration.name);
      setTargetFile(integration.targetFile);
    }
  }, [integration]);

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit({ name, targetFile });
    }
  };

  return (
    <ComponentCard title="Integration Information">
      <div>
        <Label htmlFor="name">Integration Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="targetFile">Target URL</Label>
        <Input
          type="text"
          id="targetFile"
          value={targetFile}
          onChange={(e) => setTargetFile(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="gitAddress">Git URL</Label>
        <div className="relative">
          <Input
            type="text"
            id="gitAddress"
            value={integration?.gitAddress ?? ""}
            disabled
            className="pl-[62px]"
          />
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400"
            onClick={() => {
              navigator.clipboard.writeText(integration?.gitAddress ?? "");
              toast("Copied to clipboard")
            }}
          >
            <CopyIcon className="size-6" />
          </button>
        </div>
      </div>
      <Button onClick={handleSubmit}>Update</Button>
    </ComponentCard>
  );
};
