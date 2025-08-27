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
    jobIds: string[]; // ["genome-assembly-2024-03", "rnaseq-pipeline-march"]
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
      jobId?: string;
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
      jobIds: [],
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
      jobIds: [],
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
      jobIds: [],
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
  jobIds: [
    "genome-assembly-2024-03",
    "rnaseq-pipeline-march",
    "variant-calling-cohort-a",
    "ml-training-drug-discovery",
    "protein-folding-sim-v2",
    "dna-sequencing-batch-001",
    "transcriptome-analysis-liver",
    "covid-variant-analysis",
    "cancer-biomarker-study",
    "metabolomics-pathway-map",
    "structural-biology-crystal",
    "pharmacokinetics-model",
    "single-cell-rna-seq",
    "chip-seq-histone-marks",
    "gwas-diabetes-cohort",
    "proteome-mass-spec",
  ],
};

// localStorage configuration
export const STORAGE_CONFIG = {
  key: "tracer-ec2-dashboard-filters",
  version: "1.0",
} as const;
