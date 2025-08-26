// localStorage persistence utilities for filter system
import {
  FilterState,
  FilterSet,
  DEFAULT_FILTER_SETS,
  STORAGE_CONFIG,
} from "@/types/filters";

interface StorageData {
  version: string;
  filterState: FilterState;
}

// Get default filter state
export const getDefaultFilterState = (): FilterState => ({
  activeFilterSetId: "all-data",
  filterSets: DEFAULT_FILTER_SETS,
  quickFilters: { teams: [], regions: [] },
});

// Save filter state to localStorage
export const saveFiltersToStorage = (filterState: FilterState): void => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const storageData: StorageData = {
      version: STORAGE_CONFIG.version,
      filterState,
    };
    localStorage.setItem(STORAGE_CONFIG.key, JSON.stringify(storageData));
  } catch (error) {
    console.warn("Failed to save filters to localStorage:", error);
  }
};

// Load filter state from localStorage
export const loadFiltersFromStorage = (): FilterState => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return getDefaultFilterState();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_CONFIG.key);
    if (!stored) {
      return getDefaultFilterState();
    }

    const storageData: StorageData = JSON.parse(stored);

    // Handle version migration if needed
    if (storageData.version !== STORAGE_CONFIG.version) {
      console.log("Filter storage version mismatch, using defaults");
      return getDefaultFilterState();
    }

    // Validate that the stored data has required fields
    if (!storageData.filterState || !storageData.filterState.filterSets) {
      return getDefaultFilterState();
    }

    // Ensure default filter sets exist (in case user deleted them)
    const storedFilterSets = storageData.filterState.filterSets;
    const storedIds = new Set(storedFilterSets.map(fs => fs.id));
    
    // Only add missing default filter sets
    const missingDefaults = DEFAULT_FILTER_SETS.filter(defaultFs => 
      !storedIds.has(defaultFs.id)
    );
    
    const mergedFilterSets = [
      ...storedFilterSets,
      ...missingDefaults,
    ];

    return {
      ...storageData.filterState,
      filterSets: mergedFilterSets,
    };
  } catch (error) {
    console.warn("Failed to load filters from localStorage:", error);
    return getDefaultFilterState();
  }
};

// Clear all filter data from localStorage
export const clearFilterStorage = (): void => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_CONFIG.key);
  } catch (error) {
    console.warn("Failed to clear filter storage:", error);
  }
};

// Generate unique ID for filter sets
export const generateFilterSetId = (): string => {
  return `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate filter set data
export const validateFilterSet = (
  filterSet: Partial<FilterSet>,
): filterSet is FilterSet => {
  return !!(
    filterSet.id &&
    filterSet.name &&
    filterSet.filters &&
    typeof filterSet.isDefault === "boolean" &&
    Array.isArray(filterSet.filters.teams) &&
    Array.isArray(filterSet.filters.regions)
  );
};
