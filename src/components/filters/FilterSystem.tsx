"use client";

import type React from "react";
import FilterSelect from "./FilterSelect";
import ManageViewsDialog from "./ManageViewsDialog";

interface FilterSystemProps {
  className?: string;
}

const FilterSystem: React.FC<FilterSystemProps> = ({ className = "" }) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${className}`}
    >
      <FilterSelect />
      <div className="hidden sm:block">
        <ManageViewsDialog />
      </div>
    </div>
  );
};

export default FilterSystem;
