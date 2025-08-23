import { useGetIntegrations } from "../api/useGetIntegrations";
import { useCallback, useEffect, useState } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { IntegrationCard } from "./IntegrationCard";
import { IntegrationModal } from "./IntegrationModal";
import { Button } from "~/components/ui/button";
import { useCreateIntegration } from "../api/useCreateIntegration";
import { useSetGitSshKey } from "../api/useSetGitSshKey";
import { useDialog } from "~/components/nav/DialogProvider";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

export function IntegrationDashboard() {
  const getIntegrations = useGetIntegrations();
  const createIntegration = useCreateIntegration();
  const setGitSshKey = useSetGitSshKey();
  const { prompt } = useDialog();

  const [integrations, setIntegrations] = useState<IntegrationInformation[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationInformation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    // navigate(`/.integration/integration/${integration.id}`);
  }, []);

  const onSetSshKey = useCallback(async () => {
    const sshKey = await prompt("SSH Key:", "ssh-rsa ...");
    if (!sshKey) return;
    await setGitSshKey(sshKey);
  }, []);

  const handleCardPress = useCallback((integration: IntegrationInformation) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIntegration(null);
  }, []);

  const handleIntegrationUpdate = useCallback((updatedIntegration: IntegrationInformation) => {
    setIntegrations((oldIntegrations) => {
      return oldIntegrations.map((integration) =>
        integration.id === updatedIntegration.id ? updatedIntegration : integration
      );
    });
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Header Panel with buttons */}
      <View className="bg-card border-b border-border p-6">
        <View className="flex flex-row gap-4 max-w-2xl mx-auto">
          <Button
            onPress={onNewIntegration}
            text="New Integration"
            variant="default"
            className="flex-1"
          />
          <Button
            onPress={onSetSshKey}
            text="Set SSH Key"
            variant="secondary"
            className="flex-1"
          />
        </View>
      </View>

      {/* Integration cards grid */}
      <View className="flex-1 p-6">
        <View className="flex-row flex-wrap gap-4 justify-start max-w-7xl mx-auto">
          {integrations.map((integration) => (
            <View key={integration.id} className="w-[280px]">
              <IntegrationCard 
                integration={integration}
                onPress={() => handleCardPress(integration)}
              />
            </View>
          ))}
        </View>
        
        {integrations.length === 0 && (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-lg text-muted-foreground text-center">
              No integrations yet. Create your first integration to get started.
            </Text>
          </View>
        )}
      </View>

      {/* Integration Modal */}
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          open={isModalOpen}
          onOpenChange={handleModalClose}
          onUpdate={handleIntegrationUpdate}
        />
      )}
    </View>
  );
}