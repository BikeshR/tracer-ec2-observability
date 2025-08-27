"use client";

import {
  BarChart3,
  DollarSign,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useFilteredData } from "@/hooks/useFilteredData";
import type { CostTrendPoint, EC2Instance } from "@/lib/mock-data";
import RecentAnomalies from "./RecentAnomalies";
import ResearchCostTrend from "./ResearchCostTrend";

interface EC2ApiResponse {
  instances: EC2Instance[];
  source: "mock" | "aws" | "mock-fallback" | "error";
  timestamp: string;
  error?: string;
}

interface CostApiResponse {
  totalMonthlyCost: number;
  dailyBurnRate: number;
  attributedCost: number;
  unattributedCost: number;
  costTrend: CostTrendPoint[];
  anomalies: { date: string; expectedCost: number; actualCost: number }[];
  weeklyEfficiencyScore: number;
  source: "mock" | "aws" | "mock-fallback" | "error";
  timestamp: string;
}

interface CostOverviewProps {
  className?: string;
}

export default function CostOverview({ className = "" }: CostOverviewProps) {
  const [data, setData] = useState<EC2ApiResponse | null>(null);
  const [costData, setCostData] = useState<CostApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  const { dataSource } = useDataSource();

  // Fetch EC2 instances and cost data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create URLs with dataSource parameter
        const instancesUrl = new URL("/api/instances", window.location.origin);
        const costsUrl = new URL("/api/costs", window.location.origin);
        instancesUrl.searchParams.set("dataSource", dataSource);
        costsUrl.searchParams.set("dataSource", dataSource);

        // Fetch both instances and cost data in parallel
        const [instancesResponse, costResponse] = await Promise.all([
          fetch(instancesUrl),
          fetch(costsUrl),
        ]);

        if (!instancesResponse.ok) {
          const errorData = await instancesResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Instances API Error: ${instancesResponse.status}`,
          );
        }

        if (!costResponse.ok) {
          const errorData = await costResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Cost API Error: ${costResponse.status}`,
          );
        }

        const [instancesData, costData]: [EC2ApiResponse, CostApiResponse] =
          await Promise.all([instancesResponse.json(), costResponse.json()]);

        setData(instancesData);
        setCostData(costData);
        console.log(
          "[CostOverview] Data loaded - Instances:",
          instancesData.source,
          "| Costs:",
          costData.source,
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
        console.error("CostOverview fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataSource]);

  // Transform instances for filtering (map tags.Team to team field)
  const instancesForFiltering = useMemo(
    () =>
      data?.instances?.map((instance) => ({
        ...instance,
        team: instance.tags?.Team,
        region: instance.region,
      })) || [],
    [data?.instances],
  );

  // Apply filters using the same logic as other components
  const { filteredData: filteredInstances } = useFilteredData(
    instancesForFiltering,
  );

  // Calculate cost metrics dynamically from filtered instances
  const costMetrics = useMemo(() => {
    const runningInstances = filteredInstances.filter(
      (i) => i.state === "running",
    );

    if (runningInstances.length === 0) {
      return {
        totalMonthlyCost: 0,
        projectedMonthlyCost: 0,
        dailyBurnRate: 0,
        wasteScore: 0,
        wasteAmount: 0,
        totalMonthlyCostPreviousPeriod: 0,
        dailyBurnRatePreviousPeriod: 0,
        wasteScorePreviousPeriod: 0,
      };
    }

    const totalMonthlyCost = runningInstances.reduce(
      (sum, instance) => sum + instance.monthlyCost,
      0,
    );
    const dailyBurnRate = totalMonthlyCost / 30;

    // Calculate waste score based on efficiency scores
    const avgEfficiencyScore =
      runningInstances.reduce(
        (sum, instance) => sum + instance.efficiencyScore,
        0,
      ) / runningInstances.length;
    const wasteScore = Number((100 - avgEfficiencyScore).toFixed(1));

    // Calculate waste amount (instances with high waste levels)
    const wasteAmount = runningInstances
      .filter((i) => i.wasteLevel === "high" || i.wasteLevel === "medium")
      .reduce((sum, instance) => sum + instance.monthlyCost * 0.3, 0); // Assume 30% of cost is wasted

    // Mock previous period data for trend calculations (in real app, this would come from historical data)
    const totalMonthlyCostPreviousPeriod = totalMonthlyCost * 0.95; // 5% growth
    const dailyBurnRatePreviousPeriod = totalMonthlyCostPreviousPeriod / 30;
    const wasteScorePreviousPeriod = wasteScore * 1.1; // Efficiency improved

    // Projected cost based on current trends
    const projectedMonthlyCost = totalMonthlyCost * 1.05; // 5% projected growth

    return {
      totalMonthlyCost,
      projectedMonthlyCost,
      dailyBurnRate,
      wasteScore,
      wasteAmount,
      totalMonthlyCostPreviousPeriod,
      dailyBurnRatePreviousPeriod,
      wasteScorePreviousPeriod,
    };
  }, [filteredInstances]);

  // Generate mock cost trend data from filtered instances
  const { costTrend, weeklyEfficiencyScore } = useMemo(() => {
    const runningInstances = filteredInstances.filter(
      (i) => i.state === "running",
    );
    const avgDailyCost =
      runningInstances.reduce(
        (sum, instance) => sum + instance.monthlyCost,
        0,
      ) / 30;

    // Generate 7 days of trend data
    const today = new Date();
    const trendData: CostTrendPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic daily variations
      const baseMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      const baselineCost = avgDailyCost * baseMultiplier;
      const actualCost = baselineCost * (0.9 + Math.random() * 0.2); // ±10% variation

      const efficiency = Math.min(100, (baselineCost / actualCost) * 100);
      let pattern: CostTrendPoint["pattern"];
      let annotation: string;

      if (efficiency > 85) {
        pattern = "efficient";
        annotation = "Optimal resource utilization";
      } else if (efficiency > 70) {
        pattern = "research_activity";
        annotation = "Normal research workload";
      } else if (efficiency > 50) {
        pattern = "wasteful";
        annotation = "Some resource waste detected";
      } else {
        pattern = "idle";
        annotation = "High idle resource usage";
      }

      trendData.push({
        date: date.toISOString(),
        actualCost: Number(actualCost.toFixed(2)),
        baselineCost: Number(baselineCost.toFixed(2)),
        pattern,
        annotation,
        efficiencyScore: Number(efficiency.toFixed(1)),
      });
    }

    const weeklyEfficiency = Number(
      (
        trendData.reduce((sum, point) => sum + point.efficiencyScore, 0) /
        trendData.length
      ).toFixed(1),
    );

    return { costTrend: trendData, weeklyEfficiencyScore: weeklyEfficiency };
  }, [filteredInstances]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
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

  const costChangePercent =
    costMetrics.totalMonthlyCost > 0
      ? Number(
          (
            ((costMetrics.projectedMonthlyCost - costMetrics.totalMonthlyCost) /
              costMetrics.totalMonthlyCost) *
            100
          ).toFixed(1),
        )
      : 0;

  // Calculate period comparison percentages
  const monthlyChangePercent =
    costMetrics.totalMonthlyCostPreviousPeriod > 0
      ? Number(
          (
            ((costMetrics.totalMonthlyCost -
              costMetrics.totalMonthlyCostPreviousPeriod) /
              costMetrics.totalMonthlyCostPreviousPeriod) *
            100
          ).toFixed(1),
        )
      : 0;

  const dailyChangePercent =
    costMetrics.dailyBurnRatePreviousPeriod > 0
      ? Number(
          (
            ((costMetrics.dailyBurnRate -
              costMetrics.dailyBurnRatePreviousPeriod) /
              costMetrics.dailyBurnRatePreviousPeriod) *
            100
          ).toFixed(1),
        )
      : 0;

  // Get waste level information (currently unused)
  const _wasteLevel = getWasteLevel(costMetrics.wasteScore);

  return (
    <div className={`space-y-6 mb-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resource Efficiency - Primary Status Indicator */}
        <Card className={`${getEfficiencyBackground(costMetrics.wasteScore)}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resource Efficiency
            </CardTitle>
            <Zap
              className={`h-4 w-4 ${getEfficiencyColor(costMetrics.wasteScore)}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {100 - costMetrics.wasteScore}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              {getEfficiencyTrend(
                costMetrics.wasteScore,
                costMetrics.wasteScorePreviousPeriod,
              ) > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
              )}
              {Math.abs(
                getEfficiencyTrend(
                  costMetrics.wasteScore,
                  costMetrics.wasteScorePreviousPeriod,
                ),
              ).toFixed(1)}
              % vs last month
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(costMetrics.wasteAmount)} currently wasted
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
              {formatCurrency(costMetrics.totalMonthlyCost)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyChangePercent > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-success" />
              )}
              {Math.abs(monthlyChangePercent)}% vs last month
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
              {formatCurrency(costMetrics.projectedMonthlyCost)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {costChangePercent > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-success" />
              )}
              {Math.abs(costChangePercent)}% from current
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
              {formatCurrency(costMetrics.dailyBurnRate)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dailyChangePercent > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-success" />
              )}
              {Math.abs(dailyChangePercent)}% vs yesterday
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
          data={costTrend}
          weeklyEfficiencyScore={weeklyEfficiencyScore}
        />

        {/* Recent Anomalies - Historical incidents & spikes */}
        <RecentAnomalies anomalies={costData?.anomalies || []} />
      </div>
    </div>
  );
}
