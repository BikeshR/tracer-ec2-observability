"use client";

import {
  BarChart3,
  DollarSign,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type CostData, mockCostData } from "@/lib/mock-data";
import ResearchCostTrend from "./ResearchCostTrend";

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

  // Get waste level and color based on waste score
  const getWasteLevel = (
    score: number,
  ): { level: string; color: string; bgColor: string } => {
    if (score >= 70)
      return {
        level: "High Waste",
        color: "text-red-600",
        bgColor: "bg-red-500",
      };
    if (score >= 40)
      return {
        level: "Medium Waste",
        color: "text-orange-600",
        bgColor: "bg-orange-500",
      };
    if (score >= 20)
      return {
        level: "Low Waste",
        color: "text-yellow-600",
        bgColor: "bg-yellow-500",
      };
    return {
      level: "Efficient",
      color: "text-green-600",
      bgColor: "bg-green-500",
    };
  };

  // Get efficiency color based on waste score (inverted)
  const getEfficiencyColor = (wasteScore: number): string => {
    const efficiency = 100 - wasteScore;
    if (efficiency >= 80) return "text-success";
    if (efficiency >= 60) return "text-warning";
    if (efficiency >= 40) return "text-warning";
    return "text-destructive";
  };

  // Get efficiency background based on waste score (inverted) - clean: background color + balanced border
  const getEfficiencyBackground = (wasteScore: number): string => {
    const efficiency = 100 - wasteScore;
    if (efficiency >= 80) return "bg-success/10 border-2 border-success";
    if (efficiency >= 60) return "bg-warning/10 border-2 border-warning";
    if (efficiency >= 40) return "bg-warning/10 border-2 border-warning";
    return "bg-destructive/10 border-2 border-destructive";
  };

  // Calculate efficiency trend (positive means efficiency improved)
  const getEfficiencyTrend = (
    currentWasteScore: number,
    previousWasteScore: number,
  ): number => {
    const currentEfficiency = 100 - currentWasteScore;
    const previousEfficiency = 100 - previousWasteScore;
    return currentEfficiency - previousEfficiency;
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
  const costChangePercent =
    ((costData.projectedMonthlyCost - costData.totalMonthlyCost) /
      costData.totalMonthlyCost) *
    100;

  // Calculate period comparison percentages
  const monthlyChangePercent =
    ((costData.totalMonthlyCost - costData.totalMonthlyCostPreviousPeriod) /
      costData.totalMonthlyCostPreviousPeriod) *
    100;

  const dailyChangePercent =
    ((costData.dailyBurnRate - costData.dailyBurnRatePreviousPeriod) /
      costData.dailyBurnRatePreviousPeriod) *
    100;

  // Get waste level information (currently unused)
  const _wasteLevel = getWasteLevel(costData.wasteScore);

  return (
    <div className={`space-y-6 mb-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resource Efficiency - Primary Status Indicator */}
        <Card className={`${getEfficiencyBackground(costData.wasteScore)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resource Efficiency
            </CardTitle>
            <Zap
              className={`h-4 w-4 ${getEfficiencyColor(costData.wasteScore)}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {100 - costData.wasteScore}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              {getEfficiencyTrend(
                costData.wasteScore,
                costData.wasteScorePreviousPeriod,
              ) > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
              )}
              {Math.abs(
                getEfficiencyTrend(
                  costData.wasteScore,
                  costData.wasteScorePreviousPeriod,
                ),
              ).toFixed(1)}
              % vs last month
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(costData.wasteAmount)} currently wasted
            </div>
          </CardContent>
        </Card>

        {/* Current Monthly Cost - Baseline Reality */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costData.totalMonthlyCost)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyChangePercent > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-success" />
              )}
              {Math.abs(monthlyChangePercent).toFixed(1)}% vs last month
            </div>
          </CardContent>
        </Card>

        {/* Projected Monthly Cost - Future Trajectory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected</CardTitle>
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

        {/* Daily Burn Rate - Operational Detail */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Burn</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(costData.dailyBurnRate)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dailyChangePercent > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-success" />
              )}
              {Math.abs(dailyChangePercent).toFixed(1)}% vs yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Suggestions - Immediate Actions */}
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
                  <p className="text-sm font-medium">
                    Stop Underused Instances
                  </p>
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
                  <p className="text-sm font-medium">
                    Optimize Instance Sizing
                  </p>
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

        {/* Research Cost Pattern - Root Cause Analysis */}
        <ResearchCostTrend
          data={costData.costTrend}
          weeklyEfficiencyScore={costData.weeklyEfficiencyScore}
        />

        {/* Cost Anomalies - Historical Incidents */}
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
                        <p className="text-sm font-medium">
                          Cost Spike Detected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(anomaly.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">
                        +
                        {formatCurrency(
                          anomaly.actualCost - anomaly.expectedCost,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        vs expected
                      </p>
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
      </div>
    </div>
  );
}
