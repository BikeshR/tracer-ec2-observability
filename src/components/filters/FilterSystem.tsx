"use client";

import type React from "react";
import FilterSelect from "./FilterSelect";
import ManageViewsDialog from "./ManageViewsDialog";

interface FilterSystemProps {
  className?: string;
}

const FilterSystem: React.FC<FilterSystemProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      <FilterSelect />
      <ManageViewsDialog />
    </div>
  );
};

export default FilterSystem;
