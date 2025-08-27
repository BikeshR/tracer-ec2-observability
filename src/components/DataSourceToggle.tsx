"use client";

import type React from "react";
import { Switch } from "@/components/ui/switch";
import { useDataSource } from "@/contexts/DataSourceContext";

interface DataSourceToggleProps {
  className?: string;
}

const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  className = "",
}) => {
  const { dataSource, setDataSource, isLoading } = useDataSource();

  const handleToggle = (checked: boolean) => {
    setDataSource(checked ? "real" : "mock");
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Data Source:
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Demo</span>
        <Switch
          checked={dataSource === "real"}
          onCheckedChange={handleToggle}
          aria-label="Toggle between demo and live data"
        />
        <span className="text-sm text-muted-foreground">Live</span>
      </div>
    </div>
  );
};

export default DataSourceToggle;
