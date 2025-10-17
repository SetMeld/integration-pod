import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useGetIntegrationLogs, type IntegrationLog, type LogQueryOptions } from "../api/useGetIntegrationLogs";
import { Card, CardContent, CardHeader, Text, Button, Badge } from "linked-data-browser";

interface IntegrationLogsViewerProps {
  integrationId: string;
}

const CATEGORIES: IntegrationLog["category"][] = ["deploy", "trigger", "integration", "other"];
const LEVELS: IntegrationLog["level"][] = ["info", "warn", "error", "debug"];

export function IntegrationLogsViewer({ integrationId }: IntegrationLogsViewerProps) {
  const getLogs = useGetIntegrationLogs();
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogQueryOptions>({
    limit: 50,
    offset: 0,
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  const loadLogs = async (options: LogQueryOptions = {}, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getLogs(integrationId, { ...filters, ...options });

      if (append) {
        // Append older logs to the end
        setLogs(prevLogs => [...prevLogs, ...response.logs]);
      } else {
        setLogs(response.logs);
      }

      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [integrationId]);

  useEffect(() => {
    // Scroll to bottom when new logs are loaded (not when loading more)
    if (logs.length > 0 && !loadingMore) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [logs.length, loadingMore]);

  // Auto-scroll to bottom when logs are first loaded
  useEffect(() => {
    if (logs.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, []);

  const handleFilterChange = (key: keyof LogQueryOptions, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value, offset: 0 };
    setFilters(newFilters);
    loadLogs(newFilters);
  };

  const handleLoadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    loadLogs({ offset: newOffset }, true);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLevelColor = (level: IntegrationLog["level"]) => {
    switch (level) {
      case "error": return "destructive";
      case "warn": return "secondary";
      case "info": return "default";
      case "debug": return "outline";
      default: return "default";
    }
  };

  const getCategoryColor = (category: IntegrationLog["category"]) => {
    switch (category) {
      case "deploy": return "default";
      case "trigger": return "secondary";
      case "integration": return "outline";
      case "other": return "destructive";
      default: return "default";
    }
  };

  const hasMoreLogs = pagination.offset + pagination.limit < pagination.total;

  return (
    <Card style={styles.card}>
      <CardHeader style={styles.cardHeader}>
        <Text style={styles.headerText}>
          Integration Logs
        </Text>
      </CardHeader>
      <CardContent style={styles.cardContent}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            <Button
              variant={!filters.category ? "default" : "outline"}
              text="All"
              onPress={() => handleFilterChange("category", undefined)}
              style={styles.filterButton}
            />
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={filters.category === category ? "default" : "outline"}
                text={category}
                onPress={() => handleFilterChange("category", category)}
                style={styles.filterButton}
              />
            ))}
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Level:</Text>
            <Button
              variant={!filters.level ? "default" : "outline"}
              text="All"
              onPress={() => handleFilterChange("level", undefined)}
              style={styles.filterButton}
            />
            {LEVELS.map((level) => (
              <Button
                key={level}
                variant={filters.level === level ? "default" : "outline"}
                text={level}
                onPress={() => handleFilterChange("level", level)}
                style={styles.filterButton}
              />
            ))}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Logs Stream */}
        <View style={styles.logsContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
          >
            {/* Load More Button */}
            {hasMoreLogs && (
              <View style={styles.loadMoreContainer}>
                <Button
                  variant="outline"
                  text={loadingMore ? "Loading..." : "Load More Logs"}
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  style={styles.loadMoreButton}
                />
              </View>
            )}

            {/* Loading State */}
            {loading && logs.length === 0 && (
              <View style={styles.centerContainer}>
                <Text style={styles.mutedText}>Loading logs...</Text>
              </View>
            )}

            {/* Empty State */}
            {!loading && logs.length === 0 && (
              <View style={styles.centerContainer}>
                <Text style={styles.mutedText}>No logs found</Text>
              </View>
            )}

            {/* Logs Stream */}
            {!loading && logs.length > 0 && (
              <View style={styles.logsList}>
                {logs.map((log) => (
                  <View key={log.id} style={styles.logRow}>
                    {/* Timestamp */}
                    <Text style={styles.timestamp}>
                      {formatTimestamp(log.timestamp)}
                    </Text>

                    {/* Level Badge */}
                    <Badge variant={getLevelColor(log.level)} style={styles.levelBadge}>
                      <Text style={styles.badgeText}>{log.level.toUpperCase()}</Text>
                    </Badge>

                    {/* Category Badge */}
                    <Badge variant={getCategoryColor(log.category)} style={styles.categoryBadge}>
                      <Text style={styles.badgeText}>{log.category}</Text>
                    </Badge>

                    {/* Message */}
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageText}>
                        {log.message}
                      </Text>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <View style={styles.metadataContainer}>
                          <Text style={styles.metadataLabel}>Metadata:</Text>
                          <Text style={styles.metadataText}>
                            {JSON.stringify(log.metadata, null, 2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Scroll to Bottom Button */}
          <View style={styles.scrollToBottomContainer}>
            <Button
              variant="outline"
              text="↓"
              onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={styles.scrollToBottomButton}
            />
          </View>
        </View>


      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardContent: {
    gap: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    height: 32,
    paddingHorizontal: 8,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  logsContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    backgroundColor: 'rgba(249, 250, 251, 0.2)',
    height: 400,
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadMoreContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    height: 32,
    paddingHorizontal: 16,
  },
  centerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  mutedText: {
    fontSize: 14,
    color: '#6b7280',
  },
  logsList: {
    gap: 4,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 140,
    fontFamily: 'monospace',
  },
  levelBadge: {
    minWidth: 50,
    justifyContent: 'center',
  },
  categoryBadge: {
    minWidth: 80,
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageContainer: {
    flex: 1,
    minWidth: 0,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 21,
  },
  metadataContainer: {
    marginTop: 4,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6b7280',
  },
  scrollToBottomContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  scrollToBottomButton: {
    height: 32,
    width: 32,
    padding: 0,
    borderRadius: 16,
  },
});
