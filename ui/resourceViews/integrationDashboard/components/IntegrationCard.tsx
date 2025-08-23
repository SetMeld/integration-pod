import { FunctionComponent } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { Badge } from "~/components/ui/badge";
import { TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Text } from "~/components/ui/text";

export const IntegrationCard: FunctionComponent<{
  integration: IntegrationInformation;
  onPress?: () => void;
}> = ({ integration, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="h-full border-border hover:border-primary/50 transition-colors duration-200 shadow-sm hover:shadow-md">
        <CardHeader className="pb-4 px-6 pt-6">
          <View className="flex flex-row items-start justify-between gap-3">
            <View className="flex-1 min-w-0">
              <Text className="text-lg font-semibold text-card-foreground truncate">
                {integration.name}
              </Text>
            </View>
            <Badge 
              variant={integration.status.type === "ok" ? "default" : "destructive"}
              className="shrink-0"
            >
              <Text className="text-xs font-medium">
                {integration.status.type}
              </Text>
            </Badge>
          </View>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {integration.status.type === "error" ? (
            <Text className="text-sm text-destructive leading-relaxed">
              {integration.status.message}
            </Text>
          ) : (
            <View className="space-y-2">
              <Text className="text-sm text-muted-foreground">
                Git URL: {integration.gitAddress}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Target: {integration.targetFile}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}
