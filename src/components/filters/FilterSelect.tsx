"use client";

import type React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "./FilterContext";

interface FilterSelectProps {
  className?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ className = "" }) => {
  const { filterState, setActiveFilterSet } = useFilters();

  const handleViewChange = (filterId: string) => {
    setActiveFilterSet(filterId);
  };

  const activeFilterSet = filterState.filterSets.find(
    (fs) => fs.id === filterState.activeFilterSetId,
  );

  const getFilterIcon = (filterId: string) => {
    switch (filterId) {
      case "all-data":
        return "📊";
      case "my-lab":
        return "🧪";
      case "us-east":
        return "🇺🇸";
      default:
        return "📋";
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Filter View:
      </div>
      <Select
        value={filterState.activeFilterSetId}
        onValueChange={handleViewChange}
      >
        <SelectTrigger className="w-64">
          <SelectValue>
            {activeFilterSet ? (
              <div className="flex items-center space-x-2">
                <span>{getFilterIcon(activeFilterSet.id)}</span>
                <span>{activeFilterSet.name}</span>
              </div>
            ) : (
              "Select a view..."
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filterState.filterSets.map((filterSet) => (
            <SelectItem key={filterSet.id} value={filterSet.id}>
              <div className="flex items-center space-x-2">
                <span>{getFilterIcon(filterSet.id)}</span>
                <span>{filterSet.name}</span>
                {/* Show filter details */}
                {(filterSet.filters.teams.length > 0 ||
                  filterSet.filters.regions.length > 0) && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (
                    {filterSet.filters.teams.length > 0 &&
                      `${filterSet.filters.teams.length} teams`}
                    {filterSet.filters.teams.length > 0 &&
                      filterSet.filters.regions.length > 0 &&
                      ", "}
                    {filterSet.filters.regions.length > 0 &&
                      `${filterSet.filters.regions.length} regions`}
                    )
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show active filter summary */}
      {activeFilterSet &&
        (activeFilterSet.filters.teams.length > 0 ||
          activeFilterSet.filters.regions.length > 0) && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Active:</span>
            {activeFilterSet.filters.teams.length > 0 && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                {activeFilterSet.filters.teams.join(", ")}
              </span>
            )}
            {activeFilterSet.filters.regions.length > 0 && (
              <span className="px-2 py-1 bg-accent/10 text-accent-foreground rounded-md text-xs">
                {activeFilterSet.filters.regions.join(", ")}
              </span>
            )}
          </div>
        )}
    </div>
  );
};

export default FilterSelect;
