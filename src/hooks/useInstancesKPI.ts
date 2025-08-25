"use client";

import { useCallback, useEffect, useState } from "react";
import type { EC2Instance } from "@/lib/mock-data";

interface InstancesResponse {
  instances: EC2Instance[];
  source: "mock" | "aws" | "mock-fallback";
  timestamp: string;
  error?: string;
}

interface KPIMetrics {
  activeInstances: number;
  underutilizedInstances: number;
  potentialSavings: string; // Formatted currency string
}

interface UseInstancesKPIReturn {
  metrics: KPIMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const calculateKPIMetrics = (instances: EC2Instance[]): KPIMetrics => {
  // Active Instances: count of running instances
  const activeInstances = instances.filter(
    (instance) => instance.state === "running",
  ).length;

  // Underutilized: count of instances with efficiency < 40
  const underutilizedInstances = instances.filter(
    (instance) => instance.efficiencyScore < 40 && instance.state === "running",
  ).length;

  // Potential Savings: calculate monthly savings from underutilized instances
  const underutilizedInstancesData = instances.filter(
    (instance) => instance.efficiencyScore < 40 && instance.state === "running",
  );

  // Estimate savings as 70% of cost for high waste, 30% for medium waste
  const potentialMonthlySavings = underutilizedInstancesData.reduce(
    (total, instance) => {
      if (instance.wasteLevel === "high") {
        return total + instance.monthlyCost * 0.7; // 70% savings potential
      } else if (instance.wasteLevel === "medium") {
        return total + instance.monthlyCost * 0.3; // 30% savings potential
      }
      return total;
    },
    0,
  );

  return {
    activeInstances,
    underutilizedInstances,
    potentialSavings: `$${potentialMonthlySavings.toFixed(2)}`,
  };
};

export function useInstancesKPI(): UseInstancesKPIReturn {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstancesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/instances");

      if (!response.ok) {
        throw new Error(`Failed to fetch instances: ${response.status}`);
      }

      const data: InstancesResponse = await response.json();

      // Calculate KPI metrics from instances data
      const calculatedMetrics = calculateKPIMetrics(data.instances);
      setMetrics(calculatedMetrics);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch instance data";
      setError(errorMessage);
      console.error("Error fetching instances for KPI:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstancesData();
  }, [fetchInstancesData]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchInstancesData,
  };
}
