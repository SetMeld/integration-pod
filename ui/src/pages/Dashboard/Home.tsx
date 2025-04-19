import PageMeta from "../../components/common/PageMeta";
import { useGetIntegrations } from "../../api/useGetIntegrations";
import { useCallback, useEffect, useState } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { IntegrationCard } from "./IntegrationCard";
import Button from "../../components/ui/button/Button";
import { useCreateIntegration } from "../../api/useCreateIntegration";
import { useNavigate } from "react-router";

export default function Home() {
  const getIntegrations = useGetIntegrations();
  const createIntegration = useCreateIntegration();

  const navigate = useNavigate();

  const [integrations, setIntegrations] = useState<IntegrationInformation[]>([]);

  useEffect(() => {
    getIntegrations().then((integrations) => {
      setIntegrations(integrations)
    })
  }, []);

  const onNewIntegration = useCallback(async () => {
    const name = prompt("Integration Name:", "New Integration") ?? "New Integration";
    const integration = await createIntegration(name);
    setIntegrations((oldIntegrations) => {
      return [...oldIntegrations, integration]
    });
    navigate(`/.integration/integration/${integration.id}`);
  }, []);

  return (
    <>
      <PageMeta
        title="SetMeld Integration Dashboard"
        description="A dashboard for managing your integrations to a SetMeld Solid Pod"
      />
      <Button
        size="md"
        variant="primary"
        onClick={onNewIntegration}
      >
        New Integration +
      </Button>
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-4">
        {integrations.map((integration) => (
          <div className="col-span-12 xl:col-span-4" key={integration.id}>
            <IntegrationCard integration={integration} />
          </div>
        ))}
      </div>
    </>
  );
}
