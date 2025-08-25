"use client";

import { useEffect, useState } from "react";
import { type AttributionData, mockAttributionData } from "@/lib/mock-data";

interface ApiResponse {
  attribution: AttributionData;
  source: "mock" | "aws" | "mock-fallback";
  timestamp: string;
  error?: string;
}

interface CostAttributionPanelProps {
  className?: string;
}

type ViewMode = "table" | "chart";
type BreakdownType =
  | "byTeam"
  | "byProject"
  | "byEnvironment"
  | "byInstanceType"
  | "byRegion";

const BREAKDOWN_LABELS = {
  byTeam: "Research Teams",
  byProject: "Scientific Projects",
  byEnvironment: "Environments",
  byInstanceType: "Instance Types",
  byRegion: "AWS Regions",
};

export default function CostAttributionPanel({
  className = "",
}: CostAttributionPanelProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedBreakdown, setSelectedBreakdown] =
    useState<BreakdownType>("byTeam");

  // Fetch real attribution data from API
  useEffect(() => {
    const loadAttributionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/attribution");

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const apiData: ApiResponse = await response.json();
        setData(apiData);
        console.log(
          "[CostAttributionPanel] Attribution data loaded:",
          apiData.source,
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch attribution data";
        setError(errorMessage);
        console.error("CostAttributionPanel fetch error:", err);

        // Fallback to mock data on error
        setData({
          attribution: mockAttributionData,
          source: "mock-fallback",
          timestamp: new Date().toISOString(),
          error: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAttributionData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get breakdown data based on selected type
  const getBreakdownData = () => {
    if (!data) return [];
    return data.attribution.breakdowns[selectedBreakdown] || [];
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`bg-tracer-bg-secondary rounded-lg border border-tracer-border ${className}`}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-tracer-bg-tertiary rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-tracer-bg-primary rounded"
                ></div>
              ))}
            </div>
            <div className="h-64 bg-tracer-bg-primary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`bg-tracer-bg-secondary rounded-lg border border-tracer-border p-8 text-center ${className}`}
      >
        <div className="text-tracer-text-muted text-4xl mb-4">🏷️</div>
        <h3 className="text-lg font-semibold text-tracer-text-primary mb-2">
          Attribution Data Unavailable
        </h3>
        <p className="text-tracer-text-secondary">
          Unable to load cost attribution data.
        </p>
      </div>
    );
  }

  const attributionData = data.attribution;
  const breakdownData = getBreakdownData();

  return (
    <div
      className={`bg-tracer-bg-secondary rounded-lg border border-tracer-border ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-tracer-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-tracer-text-primary">
              Cost Attribution Analysis
            </h2>
            <p className="text-sm text-tracer-text-secondary mt-1">
              Breakdown of infrastructure costs by teams, projects, and resource
              dimensions
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-tracer-bg-tertiary text-tracer-text-secondary border border-tracer-border">
                {data.source === "aws"
                  ? "🔗 Live AWS Data"
                  : data.source === "mock-fallback"
                    ? "⚠️ Fallback Data"
                    : "🔧 Mock Data"}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                viewMode === "table"
                  ? "bg-tracer-info/20 text-tracer-info border-tracer-info/30"
                  : "bg-tracer-bg-tertiary text-tracer-text-secondary border-tracer-border hover:bg-tracer-hover"
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                viewMode === "chart"
                  ? "bg-tracer-info/20 text-tracer-info border-tracer-info/30"
                  : "bg-tracer-bg-tertiary text-tracer-text-secondary border-tracer-border hover:bg-tracer-hover"
              }`}
            >
              Chart View
            </button>
          </div>
        </div>
      </div>

      {/* Attribution Summary Cards */}
      <div className="p-6 border-b border-tracer-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Cost */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Total Cost
                </p>
                <p className="text-2xl font-bold text-tracer-text-primary mt-1">
                  {formatCurrency(attributionData.totalCost)}
                </p>
              </div>
              <div className="w-10 h-10 bg-tracer-info/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Total Cost Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Attributed Cost */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Attributed
                </p>
                <p className="text-2xl font-bold text-tracer-success mt-1">
                  {formatCurrency(attributionData.attributedCost)}
                </p>
              </div>
              <div className="w-10 h-10 bg-tracer-success/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Attributed Cost Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Unaccounted Cost */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Unaccounted
                </p>
                <p className="text-2xl font-bold text-tracer-warning mt-1">
                  {formatCurrency(attributionData.unaccountedCost)}
                </p>
              </div>
              <div className="w-10 h-10 bg-tracer-warning/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Unaccounted Cost Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Attribution Rate */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Attribution Rate
                </p>
                <p className="text-2xl font-bold text-tracer-text-primary mt-1">
                  {attributionData.attributionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-tracer-info/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Attribution Rate Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Controls */}
      <div className="px-6 py-4 border-b border-tracer-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-tracer-text-primary">
            Cost Breakdown Analysis
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-tracer-text-secondary">
              Group by:
            </span>
            <select
              value={selectedBreakdown}
              onChange={(e) =>
                setSelectedBreakdown(e.target.value as BreakdownType)
              }
              className="px-3 py-1 text-sm bg-tracer-bg-tertiary border border-tracer-border rounded text-tracer-text-primary focus:outline-none focus:ring-2 focus:ring-tracer-focus"
            >
              {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {viewMode === "table" ? (
          <div className="space-y-3">
            {breakdownData.length > 0 ? (
              breakdownData.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-4 bg-tracer-bg-tertiary rounded-lg border border-tracer-border hover:bg-tracer-hover transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: `hsl(${(item.category.charCodeAt(0) * 137) % 360}, 70%, 50%)`,
                        }}
                      ></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-tracer-text-primary">
                        {item.category}
                      </p>
                      <p className="text-xs text-tracer-text-muted">
                        {item.instanceCount} instance
                        {item.instanceCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-tracer-text-primary">
                      {formatCurrency(item.cost)}
                    </p>
                    <p className="text-xs text-tracer-text-muted">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-tracer-text-muted">
                <p className="text-sm">
                  No attribution data available for this breakdown
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {breakdownData.slice(0, 6).map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tracer-text-primary font-medium">
                      {item.category}
                    </span>
                    <span className="text-tracer-text-secondary">
                      {formatCurrency(item.cost)} ({item.percentage.toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-tracer-bg-primary rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(item.percentage, 2)}%`,
                        backgroundColor: `hsl(${(item.category.charCodeAt(0) * 137) % 360}, 70%, 50%)`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Attribution Insight */}
            <div className="bg-tracer-info/10 border border-tracer-info/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-tracer-info/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-tracer-info"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Insight Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-tracer-info mb-1">
                    Research Team Insight
                  </p>
                  <p className="text-xs text-tracer-text-secondary">
                    {attributionData.attributionRate > 85
                      ? `Excellent cost attribution! ${attributionData.attributionRate.toFixed(1)}% of costs are properly tagged and tracked.`
                      : attributionData.attributionRate > 60
                        ? `Good attribution coverage at ${attributionData.attributionRate.toFixed(1)}%. Consider improving tagging for unaccounted costs.`
                        : `Low attribution rate at ${attributionData.attributionRate.toFixed(1)}%. Recommend implementing consistent resource tagging across teams.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-tracer-border bg-tracer-bg-primary/50">
        <div className="flex items-center justify-between text-xs text-tracer-text-muted">
          <span>
            Data from {attributionData.timeRange.start} to{" "}
            {attributionData.timeRange.end}
          </span>
          <span>
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
