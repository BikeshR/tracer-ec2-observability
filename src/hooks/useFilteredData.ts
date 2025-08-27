"use client";

import { useMemo } from "react";
import { useFilters } from "@/components/filters";

// Generic hook for applying filters to any data array
export const useFilteredData = <T extends { team?: string; region?: string }>(
  data: T[] | undefined,
): {
  filteredData: T[];
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
} => {
  const { activeFilters, applyFilters } = useFilters();

  return useMemo(() => {
    if (!data) {
      return {
        filteredData: [],
        totalCount: 0,
        filteredCount: 0,
        hasActiveFilters: false,
      };
    }

    const hasActiveFilters =
      activeFilters.teams.length > 0 ||
      activeFilters.regions.length > 0 ||
      activeFilters.wasteLevel.length > 0 ||
      activeFilters.instanceTypes.length > 0 ||
      activeFilters.status.length > 0 ||
      activeFilters.jobIds.length > 0;
    const filteredData = hasActiveFilters ? applyFilters(data) : data;

    return {
      filteredData,
      totalCount: data.length,
      filteredCount: filteredData.length,
      hasActiveFilters,
    };
  }, [data, activeFilters, applyFilters]);
};

// Specific hook for EC2 instances
export interface EC2Instance {
  id: string;
  name: string;
  team?: string;
  region?: string;
  instanceType?: string;
  // ... other properties
}

export const useFilteredInstances = (instances: EC2Instance[] | undefined) => {
  return useFilteredData(instances);
};

// Specific hook for cost data
export interface CostDataItem {
  team?: string;
  region?: string;
  cost: number;
  // ... other properties
}

export const useFilteredCosts = (costs: CostDataItem[] | undefined) => {
  return useFilteredData(costs);
};
