import { callApi } from "./callApi";
import { useSolidAuth } from "@ldo/solid-react";

export interface IntegrationLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  category: "deploy" | "trigger" | "integration" | "other";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface LogStats {
  total: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
}

export interface LogsResponse {
  logs: IntegrationLog[];
  stats: LogStats;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface LogQueryOptions {
  category?: IntegrationLog["category"];
  level?: IntegrationLog["level"];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export function useGetIntegrationLogs() {
  const { fetch } = useSolidAuth();

  return async (
    integrationId: string,
    options: LogQueryOptions = {}
  ): Promise<LogsResponse> => {
    const params = new URLSearchParams();
    
    if (options.category) params.append("category", options.category);
    if (options.level) params.append("level", options.level);
    if (options.startDate) params.append("startDate", options.startDate);
    if (options.endDate) params.append("endDate", options.endDate);
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const path = `/integration/${integrationId}/log${queryString ? `?${queryString}` : ""}`;

    return callApi<LogsResponse>(
      fetch,
      path,
      "json",
      "GET",
    );
  };
}
