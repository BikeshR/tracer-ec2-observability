"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type DataSource = "mock" | "real";

interface DataSourceContextType {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  isLoading: boolean;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "tracer-data-source";

export function DataSourceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataSource, setDataSourceState] = useState<DataSource>("mock");
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === "mock" || stored === "real")) {
        setDataSourceState(stored);
      }
    } catch (error) {
      console.warn("Failed to load data source preference:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage when changed
  const setDataSource = (source: DataSource) => {
    try {
      localStorage.setItem(STORAGE_KEY, source);
      setDataSourceState(source);
    } catch (error) {
      console.warn("Failed to save data source preference:", error);
      setDataSourceState(source); // Still update state even if localStorage fails
    }
  };

  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
        setDataSource,
        isLoading,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error("useDataSource must be used within a DataSourceProvider");
  }
  return context;
}
