// Filter System Types - Component 5 Implementation
import React from "react";

export interface FilterSet {
  id: string;
  name: string;
  isDefault: boolean;
  filters: {
    teams: string[]; // ["Chen Lab", "Rodriguez Lab"]
    regions: string[]; // ["us-east-1", "us-west-2"]
  };
  createdAt: string;
  lastUsed: string;
}

export interface FilterState {
  activeFilterSetId: string;
  filterSets: FilterSet[];
  quickFilters: FilterSet["filters"]; // Temporary filters not saved
}

// Filter context type for React Context
export interface FilterContextType {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  activeFilters: FilterSet["filters"];
  applyFilters: <T extends { team?: string; region?: string }>(
    data: T[],
  ) => T[];
  createFilterSet: (name: string, filters: FilterSet["filters"]) => void;
  deleteFilterSet: (id: string) => void;
  setActiveFilterSet: (id: string) => void;
  updateQuickFilters: (filters: Partial<FilterSet["filters"]>) => void;
  clearAllFilters: () => void;
}

// Default filter sets with static timestamps to prevent hydration mismatches
export const DEFAULT_FILTER_SETS: FilterSet[] = [
  {
    id: "all-data",
    name: "All Data",
    isDefault: true,
    filters: { teams: [], regions: [] },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastUsed: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "my-lab",
    name: "My Lab",
    isDefault: false,
    filters: { teams: ["Chen Lab"], regions: [] },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastUsed: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "us-east",
    name: "US East",
    isDefault: false,
    filters: { teams: [], regions: ["us-east-1"] },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastUsed: "2024-01-01T00:00:00.000Z",
  },
];

// Available options for filters
export const FILTER_OPTIONS = {
  teams: [
    "Chen Lab",
    "Rodriguez Lab",
    "Watson Lab",
    "Bioinformatics Core",
    "Smith Lab",
    "Johnson Lab",
  ],
  regions: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-2"],
};

// localStorage configuration
export const STORAGE_CONFIG = {
  key: "tracer-ec2-dashboard-filters",
  version: "1.0",
} as const;
