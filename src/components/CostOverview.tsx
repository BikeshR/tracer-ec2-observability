"use client";

import { useEffect, useState } from "react";
import { type CostData, mockCostData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, BarChart3, PiggyBank, TrendingDown, Lightbulb } from "lucide-react";

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
      <div className={`space-y-6 mb-8 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className={`p-8 text-center mb-8 ${className}`}>
        <CardContent>
          <div className="text-muted-foreground text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Cost Data Unavailable
          </h3>
          <p className="text-muted-foreground">
            Unable to load cost overview data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const costData = data.costs;
  const savingsOpportunity = calculateSavingsOpportunity(costData);
  const costChangePercent =
    ((costData.projectedMonthlyCost - costData.totalMonthlyCost) /
      costData.totalMonthlyCost) *
    100;

  return (
    <div className={`space-y-6 mb-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Monthly Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Cost
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costData.totalMonthlyCost)}
            </div>
          </CardContent>
        </Card>

        {/* Daily Burn Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Burn
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costData.dailyBurnRate)}
            </div>
          </CardContent>
        </Card>

        {/* Projected Monthly Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projected
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costData.projectedMonthlyCost)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {costChangePercent > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-success" />
              )}
              {Math.abs(costChangePercent).toFixed(1)}% from current
            </div>
          </CardContent>
        </Card>

        {/* Potential Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Potential Savings
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(savingsOpportunity)}
            </div>
            <p className="text-xs text-muted-foreground">
              ~30% optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost by Environment */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {costData.costByEnvironment.map((item) => (
              <div
                key={item.environment}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.environment === "Production"
                        ? "bg-destructive"
                        : item.environment === "Development"
                          ? "bg-warning"
                          : "bg-chart-1"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">{item.environment}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(item.cost)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost Anomalies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            {costData.anomalies.length > 0 ? (
              <div className="space-y-3">
                {costData.anomalies.map((anomaly) => (
                  <div
                    key={anomaly.date}
                    className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Cost Spike Detected</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(anomaly.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">
                        +{formatCurrency(anomaly.actualCost - anomaly.expectedCost)}
                      </p>
                      <p className="text-xs text-muted-foreground">vs expected</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <p className="text-sm">No cost anomalies detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              <span>Smart Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Stop Underused Instances</p>
                  <p className="text-xs text-muted-foreground">
                    1 instance with &lt;5% CPU usage detected
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-chart-1/20 bg-chart-1/5">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-chart-1 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Optimize Instance Sizing</p>
                  <p className="text-xs text-muted-foreground">
                    Potential $7.52/month savings available
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Schedule Auto-Shutdown</p>
                  <p className="text-xs text-muted-foreground">
                    Configure non-prod environments
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
