"use client";

import { useEffect, useState } from "react";
import { useFilteredData } from "@/hooks/useFilteredData";
import type { EC2Instance } from "@/lib/mock-data";

interface ApiResponse {
  instances: EC2Instance[];
  source: "mock" | "aws" | "mock-fallback";
  timestamp: string;
  error?: string;
}

export const useFilteredInstances = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch EC2 data
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/instances");

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const apiData: ApiResponse = await response.json();
        setData(apiData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch instances",
        );
        console.error("useFilteredInstances fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  // Transform instances for filtering (map tags.Team to team field)
  const instancesForFiltering =
    data?.instances?.map((instance) => ({
      ...instance,
      team: instance.team || instance.tags?.Team,
      region: instance.region,
    })) || [];

  // Apply filters
  const {
    filteredData: filteredInstances,
    totalCount,
    filteredCount,
    hasActiveFilters,
  } = useFilteredData(instancesForFiltering);

  return {
    instances: filteredInstances,
    totalCount,
    filteredCount,
    hasActiveFilters,
    loading,
    error,
    source: data?.source || "mock",
  };
};
