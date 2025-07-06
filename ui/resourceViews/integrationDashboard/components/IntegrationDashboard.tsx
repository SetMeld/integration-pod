import { useGetIntegrations } from "../api/useGetIntegrations";
import { useCallback, useEffect, useState } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { IntegrationCard } from "./IntegrationCard";
import { Button } from "~/components/ui/button";
import { useCreateIntegration } from "../api/useCreateIntegration";
import { useNavigate } from "react-router";
import { useDialog } from "~/components/nav/DialogProvider";
import { View } from "react-native";

export default function Home() {
  const getIntegrations = useGetIntegrations();
  const createIntegration = useCreateIntegration();
  const { prompt } = useDialog();

  const navigate = useNavigate();

  const [integrations, setIntegrations] = useState<IntegrationInformation[]>([]);

  useEffect(() => {
    getIntegrations().then((integrations) => {
      setIntegrations(integrations)
    })
  }, []);

  const onNewIntegration = useCallback(async () => {
    const name = await prompt("Integration Name:", undefined, "New Integration");
    if (!name) return;
    const integration = await createIntegration(name);
    setIntegrations((oldIntegrations) => {
      return [...oldIntegrations, integration]
    });
    navigate(`/.integration/integration/${integration.id}`);
  }, []);

  return (
    <>
      <Button
        onPress={onNewIntegration}
      >
        New Integration +
      </Button>
      <View className="grid grid-cols-12 gap-4 md:gap-6 mt-4">
        {integrations.map((integration) => (
          <View className="col-span-12 xl:col-span-4" key={integration.id}>
            <IntegrationCard integration={integration} />
          </View>
        ))}
      </View>
    </>
  );
}