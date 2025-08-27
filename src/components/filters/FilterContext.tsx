"use client";

import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  generateFilterSetId,
  loadFiltersFromStorage,
  saveFiltersToStorage,
} from "@/lib/filter-storage";
import type {
  FilterContextType,
  FilterSet,
  FilterState,
} from "@/types/filters";

// Create the context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider component
interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  console.log("FilterProvider rendering...");
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const state = loadFiltersFromStorage();
    console.log(
      "Initial filter state:",
      state.filterSets.map((fs) => `${fs.id}: ${fs.name}`),
    );
    return state;
  });

  // Auto-save to localStorage when filter state changes
  useEffect(() => {
    saveFiltersToStorage(filterState);
  }, [filterState]);

  // Get currently active filters
  const activeFilters = React.useMemo(() => {
    const activeFilterSet = filterState.filterSets.find(
      (fs) => fs.id === filterState.activeFilterSetId,
    );

    // Use quickFilters for "all-data" filter set (temporary filtering)
    if (activeFilterSet && activeFilterSet.id === "all-data") {
      return filterState.quickFilters;
    }

    if (activeFilterSet) {
      return activeFilterSet.filters;
    }

    // Fallback to quick filters if no active filter set
    return filterState.quickFilters;
  }, [
    filterState.activeFilterSetId,
    filterState.filterSets,
    filterState.quickFilters,
  ]);

  // Helper function to categorize instance types
  const categorizeInstanceType = (instanceType: string): string => {
    const type = instanceType.toLowerCase();
    if (type.includes("p3") || type.includes("g4") || type.includes("gpu")) {
      return "gpu";
    }
    if (
      type.includes("r5") ||
      type.includes("r6") ||
      type.includes("x1") ||
      type.includes("memory")
    ) {
      return "memory";
    }
    return "cpu"; // Default for t2, t3, m5, c5, etc.
  };

  // Apply filters to data array
  const applyFilters = <
    T extends {
      team?: string;
      region?: string;
      wasteLevel?: string;
      instanceType?: string;
      state?: string;
    },
  >(
    data: T[],
  ): T[] => {
    return data.filter((item) => {
      // Team filter
      if ((activeFilters.teams?.length || 0) > 0) {
        if (!item.team || !activeFilters.teams?.includes(item.team)) {
          return false;
        }
      }

      // Region filter
      if ((activeFilters.regions?.length || 0) > 0) {
        if (!item.region || !activeFilters.regions?.includes(item.region)) {
          return false;
        }
      }

      // Waste Level filter
      if ((activeFilters.wasteLevel?.length || 0) > 0) {
        if (
          !item.wasteLevel ||
          !activeFilters.wasteLevel?.includes(item.wasteLevel)
        ) {
          return false;
        }
      }

      // Instance Type filter (categorized)
      if ((activeFilters.instanceTypes?.length || 0) > 0) {
        if (!item.instanceType) {
          return false;
        }
        const category = categorizeInstanceType(item.instanceType);
        if (!activeFilters.instanceTypes?.includes(category)) {
          return false;
        }
      }

      // Status filter
      if ((activeFilters.status?.length || 0) > 0) {
        if (!item.state || !activeFilters.status?.includes(item.state)) {
          return false;
        }
      }

      return true;
    });
  };

  // Create new filter set
  const createFilterSet = (name: string, filters: FilterSet["filters"]) => {
    const newFilterSet: FilterSet = {
      id: generateFilterSetId(),
      name,
      isDefault: false,
      filters,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    setFilterState((prev) => ({
      ...prev,
      filterSets: [...prev.filterSets, newFilterSet],
      activeFilterSetId: newFilterSet.id,
    }));
  };

  // Update existing filter set
  const updateFilterSet = (
    id: string,
    name: string,
    filters: FilterSet["filters"],
  ) => {
    setFilterState((prev) => ({
      ...prev,
      filterSets: prev.filterSets.map((fs) =>
        fs.id === id
          ? {
              ...fs,
              name,
              filters,
              lastUsed: new Date().toISOString(),
            }
          : fs,
      ),
    }));
  };

  // Delete filter set
  const deleteFilterSet = (id: string) => {
    const filterSet = filterState.filterSets.find((fs) => fs.id === id);
    if (filterSet?.isDefault) {
      console.warn("Cannot delete default filter set");
      return;
    }

    setFilterState((prev) => {
      const newFilterSets = prev.filterSets.filter((fs) => fs.id !== id);
      const newActiveId =
        prev.activeFilterSetId === id ? "all-data" : prev.activeFilterSetId;

      return {
        ...prev,
        filterSets: newFilterSets,
        activeFilterSetId: newActiveId,
      };
    });
  };

  // Set active filter set
  const setActiveFilterSet = (id: string) => {
    setFilterState((prev) => ({
      ...prev,
      activeFilterSetId: id,
      // Update last used timestamp
      filterSets: prev.filterSets.map((fs) =>
        fs.id === id ? { ...fs, lastUsed: new Date().toISOString() } : fs,
      ),
    }));
  };

  // Update quick filters (temporary filters)
  const updateQuickFilters = (filters: Partial<FilterSet["filters"]>) => {
    console.log("updateQuickFilters called with:", filters);
    setFilterState((prev) => {
      const newState = {
        ...prev,
        quickFilters: {
          ...prev.quickFilters,
          ...filters,
        },
      };
      console.log("New filter state:", newState);
      return newState;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterState((prev) => ({
      ...prev,
      activeFilterSetId: "all-data",
      quickFilters: {
        teams: [],
        regions: [],
        wasteLevel: [],
        instanceTypes: [],
        status: [],
      },
    }));
  };

  const contextValue: FilterContextType = {
    filterState,
    setFilterState,
    activeFilters,
    applyFilters,
    createFilterSet,
    updateFilterSet,
    deleteFilterSet,
    setActiveFilterSet,
    updateQuickFilters,
    clearAllFilters,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook to use filter context
export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
