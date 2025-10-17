import { useGetIntegrations } from "../api/useGetIntegrations";
import { useCallback, useEffect, useState } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { IntegrationCard } from "./IntegrationCard";
import { IntegrationModal } from "./IntegrationModal";
import { useCreateIntegration } from "../api/useCreateIntegration";
import { useSetGitSshKey } from "../api/useSetGitSshKey";
import { View, StyleSheet, Text } from "react-native";
import { Button, useDialog } from "linked-data-browser";

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

  const handleIntegrationDelete = useCallback((deletedIntegrationId: string) => {
    setIntegrations((oldIntegrations) => {
      return oldIntegrations.filter((integration) => integration.id !== deletedIntegrationId);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Panel with buttons */}
      <View style={styles.header}>
        <View style={styles.buttonRow}>
          <Button
            onPress={onNewIntegration}
            text="New Integration"
            variant="default"
            style={styles.button}
          />
          <Button
            onPress={onSetSshKey}
            text="Set SSH Key"
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>

      {/* Integration cards grid */}
      <View style={styles.content}>
        <View style={styles.cardsGrid}>
          {integrations.map((integration) => (
            <View key={integration.id} style={styles.cardWrapper}>
              <IntegrationCard
                integration={integration}
                onPress={() => handleCardPress(integration)}
              />
            </View>
          ))}
        </View>

        {integrations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
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
          onDelete={handleIntegrationDelete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    padding: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    maxWidth: 672,
    marginHorizontal: 'auto',
  },
  button: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
    maxWidth: 1280,
    marginHorizontal: 'auto',
  },
  cardWrapper: {
    width: 280,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
});