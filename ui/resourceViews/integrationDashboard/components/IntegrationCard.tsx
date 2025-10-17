import { FunctionComponent } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Card, CardHeader, Badge, Text, CardContent } from "linked-data-browser";

export const IntegrationCard: FunctionComponent<{
  integration: IntegrationInformation;
  onPress?: () => void;
}> = ({ integration, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <CardHeader style={styles.cardHeader}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {integration.name}
              </Text>
            </View>
            <Badge
              variant={integration.status.type === "ok" ? "default" : "destructive"}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>
                {integration.status.type}
              </Text>
            </Badge>
          </View>
        </CardHeader>
        <CardContent style={styles.cardContent}>
          {integration.status.type === "error" ? (
            <Text style={styles.errorText}>
              {integration.status.message}
            </Text>
          ) : (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Git URL: {integration.gitAddress}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
  },
  infoContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
});
