// Filter System Types - Component 5 Implementation
import type * as React from "react";

export interface FilterSet {
  id: string;
  name: string;
  isDefault: boolean;
  filters: {
    teams: string[]; // ["Chen Lab", "Rodriguez Lab"]
    regions: string[]; // ["us-east-1", "us-west-2"]
    wasteLevel: string[]; // ["high", "medium", "low"]
    instanceTypes: string[]; // ["gpu", "cpu", "memory"]
    status: string[]; // ["running", "stopped", "pending", "stopping", "terminated"]
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
  applyFilters: <
    T extends {
      team?: string;
      region?: string;
      wasteLevel?: string;
      instanceType?: string;
      state?: string;
    },
  >(
    data: T[],
  ) => T[];
  createFilterSet: (name: string, filters: FilterSet["filters"]) => void;
  updateFilterSet: (
    id: string,
    name: string,
    filters: FilterSet["filters"],
  ) => void;
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
    filters: {
      teams: [],
      regions: [],
      wasteLevel: [],
      instanceTypes: [],
      status: [],
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastUsed: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "my-lab",
    name: "My Lab",
    isDefault: false,
    filters: {
      teams: ["Chen Genomics Laboratory"],
      regions: [],
      wasteLevel: [],
      instanceTypes: [],
      status: [],
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastUsed: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "us-east",
    name: "US East",
    isDefault: false,
    filters: {
      teams: [],
      regions: ["us-east-1"],
      wasteLevel: [],
      instanceTypes: [],
      status: [],
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastUsed: "2024-01-01T00:00:00.000Z",
  },
];

// Available options for filters
export const FILTER_OPTIONS = {
  teams: [
    "Chen Genomics Laboratory",
    "Rodriguez Bioinformatics Core",
    "Watson Computational Biology Unit",
    "Anderson Proteomics Research Center",
    "Johnson Molecular Dynamics Lab",
    "Williams Data Science Institute",
    "Brown Systems Biology Laboratory",
    "Davis Structural Biology Unit",
  ],
  regions: ["us-east-1", "us-west-2", "eu-west-1"],
  wasteLevel: ["high", "medium", "low"],
  instanceTypes: ["gpu", "cpu", "memory"],
  status: ["running", "stopped", "pending", "stopping", "terminated"],
};

// localStorage configuration
export const STORAGE_CONFIG = {
  key: "tracer-ec2-dashboard-filters",
  version: "1.0",
} as const;
