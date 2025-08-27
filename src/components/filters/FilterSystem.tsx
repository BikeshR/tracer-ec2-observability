"use client";

import type React from "react";
import DataSourceToggle from "@/components/DataSourceToggle";
import FilterSelect from "./FilterSelect";
import ManageViewsDialog from "./ManageViewsDialog";

interface FilterSystemProps {
  className?: string;
}

const FilterSystem: React.FC<FilterSystemProps> = ({ className = "" }) => {
  return (
    <div className={`space-y-4 mb-8 ${className}`}>
      {/* Mobile Data Source Toggle */}
      <div className="lg:hidden">
        <DataSourceToggle />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FilterSelect />
        <div className="hidden sm:block">
          <ManageViewsDialog />
        </div>
      </div>
    </div>
  );
};

export default FilterSystem;
