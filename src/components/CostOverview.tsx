"use client";

import { useEffect, useState } from "react";
import { type CostData, mockCostData } from "@/lib/mock-data";

interface ApiResponse {
  costs: CostData;
  source: "mock" | "aws" | "mock-fallback";
  timestamp: string;
  error?: string;
}

interface CostOverviewProps {
  className?: string;
}

export default function CostOverview({ className = "" }: CostOverviewProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  // Fetch real cost data from API
  useEffect(() => {
    const loadCostData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/costs");

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const apiData: ApiResponse = await response.json();
        setData(apiData);
        console.log("[CostOverview] Cost data loaded:", apiData.source);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch cost data";
        setError(errorMessage);
        console.error("CostOverview fetch error:", err);

        // Fallback to mock data on error
        setData({
          costs: mockCostData,
          source: "mock-fallback",
          timestamp: new Date().toISOString(),
          error: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCostData();
  }, []);

  // Calculate savings opportunity from waste
  const calculateSavingsOpportunity = (data: CostData): number => {
    // Assume we can save 30% of total cost through optimization
    return data.totalMonthlyCost * 0.3;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-tracer-bg-primary rounded"
                ></div>
              ))}
            </div>
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
        <div className="text-tracer-text-muted text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-tracer-text-primary mb-2">
          Cost Data Unavailable
        </h3>
        <p className="text-tracer-text-secondary">
          Unable to load cost overview data.
        </p>
      </div>
    );
  }

  const costData = data.costs;
  const savingsOpportunity = calculateSavingsOpportunity(costData);
  const costChangePercent =
    ((costData.projectedMonthlyCost - costData.totalMonthlyCost) /
      costData.totalMonthlyCost) *
    100;

  return (
    <div
      className={`bg-tracer-bg-secondary rounded-lg border border-tracer-border ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-tracer-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-tracer-text-primary">
              Cost Overview
            </h2>
            <p className="text-sm text-tracer-text-secondary mt-1">
              AWS infrastructure cost insights and optimization opportunities
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-tracer-bg-tertiary text-tracer-text-secondary border border-tracer-border">
                {data.source === "aws"
                  ? "💰 Live AWS Billing"
                  : data.source === "mock-fallback"
                    ? "⚠️ Fallback Data"
                    : "🔧 Mock Data"}
              </span>
            </p>
          </div>
          <div className="text-sm text-tracer-text-muted">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Cost Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Current Monthly Cost */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Monthly Cost
                </p>
                <p className="text-2xl font-bold text-tracer-text-primary mt-1">
                  {formatCurrency(costData.totalMonthlyCost)}
                </p>
              </div>
              <div className="w-10 h-10 bg-tracer-info/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Monthly Cost Icon</title>
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

          {/* Daily Burn Rate */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Daily Burn
                </p>
                <p className="text-2xl font-bold text-tracer-text-primary mt-1">
                  {formatCurrency(costData.dailyBurnRate)}
                </p>
              </div>
              <div className="w-10 h-10 bg-tracer-warning/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Daily Burn Rate Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Projected Monthly Cost */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Projected
                </p>
                <p className="text-2xl font-bold text-tracer-text-primary mt-1">
                  {formatCurrency(costData.projectedMonthlyCost)}
                </p>
                <div className="flex items-center mt-1">
                  <span
                    className={`text-xs font-medium ${costChangePercent > 0 ? "text-tracer-danger" : "text-tracer-success"}`}
                  >
                    {costChangePercent > 0 ? "↗" : "↘"}{" "}
                    {Math.abs(costChangePercent).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 bg-tracer-success/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Projected Cost Icon</title>
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

          {/* Savings Opportunity */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tracer-text-secondary">
                  Potential Savings
                </p>
                <p className="text-2xl font-bold text-tracer-success mt-1">
                  {formatCurrency(savingsOpportunity)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium text-tracer-text-muted">
                    ~30% optimization
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 bg-tracer-success/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tracer-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Potential Savings Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost by Environment */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <h3 className="text-lg font-semibold text-tracer-text-primary mb-4">
              Cost by Environment
            </h3>
            <div className="space-y-3">
              {costData.costByEnvironment.map((item) => (
                <div
                  key={item.environment}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.environment === "Production"
                          ? "bg-tracer-danger"
                          : item.environment === "Development"
                            ? "bg-tracer-warning"
                            : "bg-tracer-info"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-tracer-text-secondary">
                      {item.environment}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-tracer-text-primary">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Anomalies */}
          <div className="bg-tracer-bg-tertiary rounded-lg border border-tracer-border p-4">
            <h3 className="text-lg font-semibold text-tracer-text-primary mb-4">
              Recent Anomalies
            </h3>
            {costData.anomalies.length > 0 ? (
              <div className="space-y-3">
                {costData.anomalies.map((anomaly) => (
                  <div
                    key={anomaly.date}
                    className="flex items-center justify-between p-3 bg-tracer-danger/10 rounded-lg border border-tracer-danger/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-tracer-danger rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-tracer-text-primary">
                          Cost Spike Detected
                        </p>
                        <p className="text-xs text-tracer-text-muted">
                          {new Date(anomaly.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-tracer-danger">
                        +
                        {formatCurrency(
                          anomaly.actualCost - anomaly.expectedCost,
                        )}
                      </p>
                      <p className="text-xs text-tracer-text-muted">
                        vs expected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-tracer-text-muted">
                <p className="text-sm">No cost anomalies detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
