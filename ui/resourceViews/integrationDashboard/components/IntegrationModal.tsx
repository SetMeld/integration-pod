import React, { useState } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { useUpdateIntegration } from "../api/useUpdateIntegration";
import { useDeleteIntegration } from "../api/useDeleteIntegration";
import { Badge, Button, Card, CardContent, CardHeader, Input, Text, useDialog } from "linked-data-browser";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "linked-data-browser";
import { IntegrationLogsViewer } from "./IntegrationLogsViewer";
import { ScrollView, StyleSheet, View } from "react-native";

interface IntegrationModalProps {
  integration: IntegrationInformation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedIntegration: IntegrationInformation) => void;
  onDelete?: (deletedIntegrationId: string) => void;
}

export function IntegrationModal({
  integration,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: IntegrationModalProps) {
  const updateIntegration = useUpdateIntegration();
  const deleteIntegration = useDeleteIntegration();
  const { prompt } = useDialog();
  const [name, setName] = useState(integration.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "logs">("details");

  const handleCopyGitUrl = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(integration.gitAddress);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = integration.gitAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedIntegration = await updateIntegration(integration.id, {
        name,
      });
      onUpdate?.(updatedIntegration);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update integration:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    // Show confirmation dialog
    const confirmed = await prompt(
      `Are you sure you want to delete "${integration.name}"?`,
      "Type 'DELETE' to confirm"
    );

    // Only proceed if user typed 'DELETE'
    if (confirmed !== "DELETE") {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteIntegration(integration.id);
      onDelete?.(integration.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete integration:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{
        maxWidth: 900,
        width: 'calc(100vw - 2rem)' as any,
        marginHorizontal: 16,
        marginVertical: 32,
        height: 'calc(100vh - 4rem)' as any,
      }}>
        <DialogHeader style={{ paddingBottom: 24 }}>
          <DialogTitle style={{ fontSize: 20, fontWeight: '600' }}>Integration Details</DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <Button
            variant={activeTab === "details" ? "default" : "ghost"}
            text="Details"
            onPress={() => setActiveTab("details")}
            style={[styles.tabButton, activeTab === "details" && styles.activeTabButton]}
          />
          <Button
            variant={activeTab === "logs" ? "default" : "ghost"}
            text="Logs"
            onPress={() => setActiveTab("logs")}
            style={[styles.tabButton, activeTab === "logs" && styles.activeTabButton]}
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1, minHeight: '100%' }}>
          <View style={styles.contentContainer}>
            {activeTab === "details" && (
              <View style={styles.spacingContainer}>
                {/* Integration Status Section */}
                <Card style={{ borderWidth: 1, borderColor: 'hsl(var(--border))' }}>
                  <CardHeader style={{ paddingBottom: 16 }}>
                    <Text style={styles.cardTitle}>
                      Integration Status
                    </Text>
                  </CardHeader>
                  <CardContent style={styles.cardContentSpacing}>
                    <View style={styles.flexRowCenter}>
                      <Badge variant={integration.status.type === "ok" ? "default" : "destructive"}>
                        <Text style={styles.badgeText}>
                          {integration.status.type}
                        </Text>
                      </Badge>
                    </View>
                    {integration.status.type === "error" && (
                      <Text style={styles.errorText}>
                        {integration.status.message}
                      </Text>
                    )}
                  </CardContent>
                </Card>

                {/* Integration Information Section */}
                <Card style={{ borderWidth: 1, borderColor: 'hsl(var(--border))' }}>
                  <CardHeader style={{ paddingBottom: 16 }}>
                    <Text style={styles.cardTitle}>
                      Integration Information
                    </Text>
                  </CardHeader>
                  <CardContent style={styles.inputContainer}>
                    <Input
                      label="Integration Name"
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter integration name"
                    />

                    <Input
                      label="Git URL"
                      value={integration.gitAddress}
                      editable={false}
                      buttonRight={{
                        text: "Copy",
                        onPress: handleCopyGitUrl,
                        variant: "outline",
                      }}
                    />
                  </CardContent>
                </Card>
              </View>
            )}

            {activeTab === "logs" && (
              <View style={styles.spacingContainer}>
                <IntegrationLogsViewer integrationId={integration.id} />
              </View>
            )}

            {/* Footer - Only show on details tab */}
            {activeTab === "details" && (
              <View style={styles.footer}>
                <View style={styles.buttonRow}>
                  <Button
                    variant="destructive"
                    onPress={handleDelete}
                    text="Delete Integration"
                    isLoading={isDeleting}
                    style={styles.flexButton}
                  />
                  <Button
                    onPress={handleUpdate}
                    text="Update Integration"
                    isLoading={isUpdating}
                    style={styles.flexButton}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  tabButton: {
    flex: 1,
    borderRadius: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: 'hsl(var(--primary))',
  },
  scrollView: {
    flex: 1,
    marginHorizontal: -32,
  },
  contentContainer: {
    paddingHorizontal: 32,
  },
  spacingContainer: {
    gap: 24,
  },
  cardContentSpacing: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'hsl(var(--card-foreground))',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: 'hsl(var(--destructive))',
    lineHeight: 24,
  },
  inputContainer: {
    gap: 16,
  },
  footer: {
    paddingTop: 24,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexButton: {
    flex: 1,
  },
});
