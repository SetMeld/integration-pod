import { FunctionComponent, useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { IntegrationInformation, LogTypes } from "../../../../common/IntegrationInformation";
import Badge from "../../components/ui/badge/Badge";
import { useGetLogs } from "../../api/useGetLogs";

export const IntegrationStaus: FunctionComponent<{
  integration?: IntegrationInformation
}> = ({ integration }) => {
  const getLogs = useGetLogs();

  const [curLogType, setLogType] = useState<LogTypes | undefined>();
  const [curLogs, setCurLogs] = useState("");

  useEffect(() => {
    if (integration && curLogType) {
      getLogs(integration.id, curLogType).then((logs) => {
        setCurLogs(logs);
      })
    }
  }, [curLogType, integration?.id]);

  return (
    <>
      <ComponentCard title="Integration Status">
        {/* STATUS */}
        {integration?.status && <p>
          <Badge color="success">
            {integration.status.type === "ok" ? "Ok" : "Error"}
          </Badge>
          {integration.status.type === "error" ? integration.status.message : ""}
        </p>}
      </ComponentCard>
      <ComponentCard title="Logs">
        <select
          value={curLogType}
          onChange={(e) => {
            setLogType(e.target.value as LogTypes);
          }}
          className="border-gray-200 border-1 p-4 rounded"
        >
          {[undefined, "deploy", "trigger", "integration"].map((type: string | undefined) => (
            <option
              key={type}
              value={type}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {type ?? "Select Log Type"}
            </option>
          ))}
        </select>
        <pre>{curLogs}</pre>
      </ComponentCard>
    </>
  )
}
