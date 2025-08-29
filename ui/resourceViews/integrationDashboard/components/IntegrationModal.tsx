import React, { useState } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { useUpdateIntegration } from "../api/useUpdateIntegration";
import { useDeleteIntegration } from "../api/useDeleteIntegration";
import { useDialog } from "~/components/nav/DialogProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { View } from "react-native";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Text } from "~/components/ui/text";

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
  const [targetUrl, setTargetUrl] = useState(integration.targetFile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        targetFile: targetUrl,
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
      "Type 'DELETE' to confirm",
      "Delete Integration"
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
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">Integration Details</DialogTitle>
        </DialogHeader>

        <View className="space-y-6">
          {/* Integration Status Section */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <Text className="text-base font-medium text-card-foreground">
                Integration Status
              </Text>
            </CardHeader>
            <CardContent className="space-y-3">
              <View className="flex flex-row items-center gap-3">
                <Badge variant={integration.status.type === "ok" ? "default" : "destructive"}>
                  <Text className="text-sm font-medium">
                    {integration.status.type}
                  </Text>
                </Badge>
              </View>
              {integration.status.type === "error" && (
                <Text className="text-sm text-destructive leading-relaxed">
                  {integration.status.message}
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Integration Information Section */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <Text className="text-base font-medium text-card-foreground">
                Integration Information
              </Text>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Integration Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter integration name"
              />
              
              <Input
                label="Target URL"
                value={targetUrl}
                onChangeText={setTargetUrl}
                placeholder="Enter target URL"
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

        <DialogFooter className="pt-6 gap-3">
          <Button
            variant="destructive"
            onPress={handleDelete}
            text="Delete Integration"
            isLoading={isDeleting}
            className="flex-1"
          />
          <Button
            onPress={handleUpdate}
            text="Update Integration"
            isLoading={isUpdating}
            className="flex-1"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
