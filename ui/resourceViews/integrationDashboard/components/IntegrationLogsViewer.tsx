import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView } from "react-native";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useGetIntegrationLogs, type IntegrationLog, type LogQueryOptions } from "../api/useGetIntegrationLogs";

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
        // Prepend older logs to the beginning
        setLogs(prevLogs => [...response.logs, ...prevLogs]);
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
    <Card className="border-border">
      <CardHeader className="pb-4">
        <Text className="text-base font-medium text-card-foreground">
          Integration Logs
        </Text>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <View className="flex flex-row flex-wrap gap-2">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-sm font-medium">Category:</Text>
            <Button
              variant={!filters.category ? "default" : "outline"}
              text="All"
              onPress={() => handleFilterChange("category", undefined)}
              className="h-8 px-2"
            />
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={filters.category === category ? "default" : "outline"}
                text={category}
                onPress={() => handleFilterChange("category", category)}
                className="h-8 px-2"
              />
            ))}
          </View>
          
          <View className="flex flex-row items-center gap-2">
            <Text className="text-sm font-medium">Level:</Text>
            <Button
              variant={!filters.level ? "default" : "outline"}
              text="All"
              onPress={() => handleFilterChange("level", undefined)}
              className="h-8 px-2"
            />
            {LEVELS.map((level) => (
              <Button
                key={level}
                variant={filters.level === level ? "default" : "outline"}
                text={level}
                onPress={() => handleFilterChange("level", level)}
                className="h-8 px-2"
              />
            ))}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        )}

        {/* Logs Stream */}
        <View className="border border-border rounded-md bg-muted/20 h-[400px] overflow-hidden relative">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          >
            {/* Load More Button */}
            {hasMoreLogs && (
              <View className="mb-4 flex items-center">
                <Button
                  variant="outline"
                  text={loadingMore ? "Loading..." : "Load More Logs"}
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  className="h-8 px-4"
                />
              </View>
            )}

            {/* Loading State */}
            {loading && logs.length === 0 && (
              <View className="p-4 items-center">
                <Text className="text-sm text-muted-foreground">Loading logs...</Text>
              </View>
            )}

            {/* Empty State */}
            {!loading && logs.length === 0 && (
              <View className="p-4 items-center">
                <Text className="text-sm text-muted-foreground">No logs found</Text>
              </View>
            )}

            {/* Logs Stream */}
            {!loading && logs.length > 0 && (
              <View className="space-y-1">
                {logs.map((log) => (
                  <View key={log.id} className="flex flex-row items-start gap-3 py-1 border-b border-border/30 last:border-b-0">
                    {/* Timestamp */}
                    <Text className="text-xs text-muted-foreground min-w-[140px] font-mono">
                      {formatTimestamp(log.timestamp)}
                    </Text>
                    
                    {/* Level Badge */}
                    <Badge variant={getLevelColor(log.level)} className="min-w-[50px] justify-center">
                      <Text className="text-xs font-medium">{log.level.toUpperCase()}</Text>
                    </Badge>
                    
                    {/* Category Badge */}
                    <Badge variant={getCategoryColor(log.category)} className="min-w-[80px] justify-center">
                      <Text className="text-xs font-medium">{log.category}</Text>
                    </Badge>
                    
                    {/* Message */}
                    <View className="flex-1 min-w-0">
                      <Text className="text-sm font-mono leading-relaxed break-words">
                        {log.message}
                      </Text>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <View className="mt-1 p-2 bg-background/50 rounded border border-border/50">
                          <Text className="text-xs text-muted-foreground mb-1">Metadata:</Text>
                          <Text className="text-xs font-mono text-muted-foreground">
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
            <View className="absolute bottom-4 right-4">
              <Button
                variant="outline"
                text="↓"
                onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                className="h-8 w-8 p-0 rounded-full"
              />
            </View>
          </View>


      </CardContent>
    </Card>
  );
}
