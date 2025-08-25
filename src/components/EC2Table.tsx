"use client";

import { useEffect, useState } from "react";
import type { EC2Instance } from "@/lib/mock-data";

interface ApiResponse {
  instances: EC2Instance[];
  source: "mock" | "aws" | "mock-fallback";
  timestamp: string;
  error?: string;
}

type SortField =
  | "name"
  | "instanceType"
  | "cpuUtilization"
  | "costPerHour"
  | "efficiencyScore"
  | "wasteLevel";
type SortDirection = "asc" | "desc";

export default function EC2Table() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("efficiencyScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fetch EC2 data
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/instances");

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const apiData: ApiResponse = await response.json();
        setData(apiData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch instances",
        );
        console.error("EC2Table fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  // Sort instances
  const sortedInstances = data?.instances
    ? [...data.instances].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle waste level sorting
        if (sortField === "wasteLevel") {
          const wasteOrder = { high: 3, medium: 2, low: 1 };
          aValue = wasteOrder[a.wasteLevel];
          bValue = wasteOrder[b.wasteLevel];
        }

        // Handle string vs number comparison
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  // Handle column header clicks for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "efficiencyScore" ? "asc" : "desc"); // Default to ascending for efficiency, descending for others
    }
  };

  // Get waste level styling
  const getWasteLevelStyling = (
    wasteLevel: "low" | "medium" | "high",
    efficiencyScore: number,
  ) => {
    switch (wasteLevel) {
      case "high":
        return {
          bgClass: "bg-tracer-danger/10",
          textClass: "text-tracer-danger",
          badgeClass:
            "bg-tracer-danger/10 text-tracer-danger border border-tracer-danger/20",
          icon: "🔴",
          label: "High Waste",
        };
      case "medium":
        return {
          bgClass: "bg-tracer-warning/10",
          textClass: "text-tracer-warning",
          badgeClass:
            "bg-tracer-warning/10 text-tracer-warning border border-tracer-warning/20",
          icon: "🟡",
          label: "Medium Waste",
        };
      case "low":
        return {
          bgClass: "bg-tracer-success/10",
          textClass: "text-tracer-success",
          badgeClass:
            "bg-tracer-success/10 text-tracer-success border border-tracer-success/20",
          icon: "🟢",
          label: "Efficient",
        };
    }
  };

  // Get utilization styling
  const getUtilizationStyling = (utilization: number) => {
    if (utilization < 20) return "text-tracer-danger font-semibold";
    if (utilization < 60) return "text-tracer-warning font-medium";
    return "text-tracer-success font-semibold";
  };

  // Get state styling
  const getStateStyling = (state: string) => {
    switch (state.toLowerCase()) {
      case "running":
        return "bg-tracer-success/10 text-tracer-success border border-tracer-success/20";
      case "stopped":
        return "bg-tracer-bg-tertiary text-tracer-text-secondary border border-tracer-border";
      case "pending":
        return "bg-tracer-info/10 text-tracer-info border border-tracer-info/20";
      case "shutting-down":
      case "stopping":
        return "bg-tracer-warning/10 text-tracer-warning border border-tracer-warning/20";
      case "terminated":
        return "bg-tracer-danger/10 text-tracer-danger border border-tracer-danger/20";
      default:
        return "bg-tracer-bg-tertiary text-tracer-text-muted border border-tracer-border";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tracer-bg-tertiary rounded w-64"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-tracer-bg-primary rounded"></div>
            ))}
          </div>
        </div>
        <p className="text-center text-tracer-text-secondary mt-4">
          Loading EC2 instances...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border p-8">
        <div className="text-center">
          <div className="text-tracer-danger text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-tracer-text-primary mb-2">
            Failed to Load EC2 Data
          </h3>
          <p className="text-tracer-text-secondary mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-tracer-info text-white px-4 py-2 rounded-md hover:bg-tracer-active transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.instances || data.instances.length === 0) {
    return (
      <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border p-8">
        <div className="text-center">
          <div className="text-tracer-text-muted text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-tracer-text-primary mb-2">
            No EC2 Instances Found
          </h3>
          <p className="text-tracer-text-secondary">
            {data?.source === "aws"
              ? "No EC2 instances found in your AWS account."
              : "No instance data available."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-tracer-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-tracer-text-primary">
              EC2 Instance Utilization
            </h2>
            <p className="text-sm text-tracer-text-secondary mt-1">
              {data.instances.length} instance
              {data.instances.length !== 1 ? "s" : ""} found
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-tracer-bg-tertiary text-tracer-text-secondary border border-tracer-border">
                {data.source === "aws" ? "🔗 Live AWS Data" : "🔧 Mock Data"}
              </span>
            </p>
          </div>
          <div className="text-sm text-tracer-text-muted">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-tracer-bg-tertiary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className="flex items-center space-x-1 hover:text-tracer-text-secondary transition-colors"
                >
                  <span>Instance</span>
                  {sortField === "name" && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleSort("cpuUtilization")}
                  className="flex items-center space-x-1 hover:text-tracer-text-secondary transition-colors"
                >
                  <span>CPU Usage</span>
                  {sortField === "cpuUtilization" && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                Memory %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleSort("costPerHour")}
                  className="flex items-center space-x-1 hover:text-tracer-text-secondary transition-colors"
                >
                  <span>Cost/Hour</span>
                  {sortField === "costPerHour" && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleSort("efficiencyScore")}
                  className="flex items-center space-x-1 hover:text-tracer-text-secondary transition-colors"
                >
                  <span>Efficiency</span>
                  {sortField === "efficiencyScore" && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-tracer-text-muted uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleSort("wasteLevel")}
                  className="flex items-center space-x-1 hover:text-tracer-text-secondary transition-colors"
                >
                  <span>Waste Alert</span>
                  {sortField === "wasteLevel" && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tracer-border">
            {sortedInstances.map((instance) => {
              const wasteStyling = getWasteLevelStyling(
                instance.wasteLevel,
                instance.efficiencyScore,
              );

              return (
                <tr
                  key={instance.instanceId}
                  className={`hover:bg-tracer-hover ${wasteStyling.bgClass}`}
                >
                  {/* Instance Info */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-tracer-text-primary">
                        {instance.name}
                      </div>
                      <div className="text-sm text-tracer-text-secondary">
                        {instance.instanceType} • {instance.instanceId}
                      </div>
                      <div className="text-xs text-tracer-text-muted">
                        {instance.region}
                      </div>
                    </div>
                  </td>

                  {/* CPU Utilization */}
                  <td className="px-6 py-4">
                    <div
                      className={`text-sm font-medium ${getUtilizationStyling(instance.cpuUtilization)}`}
                    >
                      {instance.cpuUtilization.toFixed(1)}%
                    </div>
                  </td>

                  {/* Memory Utilization */}
                  <td className="px-6 py-4">
                    <div
                      className={`text-sm font-medium ${getUtilizationStyling(instance.memoryUtilization)}`}
                    >
                      {instance.memoryUtilization.toFixed(1)}%
                    </div>
                  </td>

                  {/* Cost */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-tracer-text-primary font-medium">
                      ${instance.costPerHour.toFixed(4)}
                    </div>
                    <div className="text-xs text-tracer-text-secondary">
                      ${instance.monthlyCost.toFixed(2)}/month
                    </div>
                  </td>

                  {/* State */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateStyling(instance.state)}`}
                    >
                      {instance.state}
                    </span>
                  </td>

                  {/* Efficiency Score */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`text-sm font-semibold ${wasteStyling.textClass}`}
                      >
                        {instance.efficiencyScore}/100
                      </div>
                    </div>
                  </td>

                  {/* Waste Alert */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{wasteStyling.icon}</span>
                      <div>
                        <div
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${wasteStyling.badgeClass}`}
                        >
                          {wasteStyling.label}
                        </div>
                        {instance.wasteLevel === "high" && (
                          <div className="text-xs text-tracer-danger mt-1">
                            💰 Potential savings available
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-tracer-bg-tertiary border-t border-tracer-border text-xs text-tracer-text-muted">
        <div className="flex justify-between items-center">
          <div>
            Showing {sortedInstances.length} of {data.instances.length}{" "}
            instances
          </div>
          <div>
            🔴 High Waste:{" "}
            {sortedInstances.filter((i) => i.wasteLevel === "high").length} • 🟡
            Medium:{" "}
            {sortedInstances.filter((i) => i.wasteLevel === "medium").length} •
            🟢 Efficient:{" "}
            {sortedInstances.filter((i) => i.wasteLevel === "low").length}
          </div>
        </div>
      </div>
    </div>
  );
}
