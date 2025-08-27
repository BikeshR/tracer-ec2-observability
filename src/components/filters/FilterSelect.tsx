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
                {((filterSet.filters.teams?.length || 0) > 0 ||
                  (filterSet.filters.regions?.length || 0) > 0 ||
                  (filterSet.filters.wasteLevel?.length || 0) > 0 ||
                  (filterSet.filters.instanceTypes?.length || 0) > 0 ||
                  (filterSet.filters.status?.length || 0) > 0) && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (
                    {[
                      (filterSet.filters.teams?.length || 0) > 0 &&
                        `${filterSet.filters.teams.length} teams`,
                      (filterSet.filters.regions?.length || 0) > 0 &&
                        `${filterSet.filters.regions.length} regions`,
                      (filterSet.filters.wasteLevel?.length || 0) > 0 &&
                        `${filterSet.filters.wasteLevel.length} waste levels`,
                      (filterSet.filters.instanceTypes?.length || 0) > 0 &&
                        `${filterSet.filters.instanceTypes.length} types`,
                      (filterSet.filters.status?.length || 0) > 0 &&
                        `${filterSet.filters.status.length} status`,
                      (filterSet.filters.jobIds?.length || 0) > 0 &&
                        `${filterSet.filters.jobIds.length} jobs`,
                    ]
                      .filter(Boolean)
                      .join(", ")}
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
        ((activeFilterSet.filters.teams?.length || 0) > 0 ||
          (activeFilterSet.filters.regions?.length || 0) > 0 ||
          (activeFilterSet.filters.wasteLevel?.length || 0) > 0 ||
          (activeFilterSet.filters.instanceTypes?.length || 0) > 0 ||
          (activeFilterSet.filters.status?.length || 0) > 0 ||
          (activeFilterSet.filters.jobIds?.length || 0) > 0) && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-wrap">
            <span>Active:</span>
            {(activeFilterSet.filters.teams?.length || 0) > 0 && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                Teams: {activeFilterSet.filters.teams?.join(", ")}
              </span>
            )}
            {(activeFilterSet.filters.regions?.length || 0) > 0 && (
              <span className="px-2 py-1 bg-accent/10 text-accent-foreground rounded-md text-xs">
                Regions: {activeFilterSet.filters.regions?.join(", ")}
              </span>
            )}
            {(activeFilterSet.filters.wasteLevel?.length || 0) > 0 && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-md text-xs">
                Waste: {activeFilterSet.filters.wasteLevel?.join(", ")}
              </span>
            )}
            {(activeFilterSet.filters.instanceTypes?.length || 0) > 0 && (
              <span className="px-2 py-1 bg-warning/10 text-warning rounded-md text-xs">
                Types: {activeFilterSet.filters.instanceTypes?.join(", ")}
              </span>
            )}
            {(activeFilterSet.filters.status?.length || 0) > 0 && (
              <span className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-xs">
                Status: {activeFilterSet.filters.status?.join(", ")}
              </span>
            )}
            {(activeFilterSet.filters.jobIds?.length || 0) > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                Jobs: {activeFilterSet.filters.jobIds?.join(", ")}
              </span>
            )}
          </div>
        )}
    </div>
  );
};

export default FilterSelect;
