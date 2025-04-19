import { FunctionComponent } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import Badge from "../../components/ui/badge/Badge";
import { useNavigate } from "react-router";

export const IntegrationCard: FunctionComponent<{
  integration: IntegrationInformation
}> = ({ integration }) => {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
      onClick={() => navigate(`/.integration/integration/${integration.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="flex items-end justify-between mt-0">
        <div>
          <span
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            <Badge color="success">
              {integration.status.type === "ok" ? "Ok" : "Error"}
            </Badge>
            {integration.status.type === "error" ? integration.status.message : ""}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {integration.name}
          </h4>
        </div>
      </div>
    </div>
  )
}