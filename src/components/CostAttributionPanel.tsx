"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Table,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  | "byRegion"
  | "byJob";

const BREAKDOWN_LABELS = {
  byTeam: "Research Teams",
  byProject: "Scientific Projects",
  byEnvironment: "Environments",
  byInstanceType: "Instance Types",
  byRegion: "AWS Regions",
  byJob: "Computational Jobs",
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
    const breakdownData = data.attribution.breakdowns[selectedBreakdown] || [];

    // Add unattributed cost as a separate entry
    const unattributedEntry = {
      category: "Unattributed",
      cost: data.attribution.unaccountedCost,
      percentage:
        (data.attribution.unaccountedCost / data.attribution.totalCost) * 100,
      instanceCount: 0, // Unknown for unattributed
    };

    return [...breakdownData, unattributedEntry];
  };

  // Generate consistent colors for pie chart
  const generateColor = (category: string): string => {
    if (category === "Unattributed") {
      return "hsl(0, 0%, 60%)"; // Gray for unattributed
    }

    // Hash the entire string for better color distribution
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      const char = category.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  };

  // Prepare data for pie chart (all data, not sliced to show unattributed)
  const pieChartData = getBreakdownData().map((item) => ({
    ...item,
    name: item.category,
    value: item.cost,
    color: generateColor(item.category),
  }));

  // Loading state
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}
      >
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}
      >
        <Card className="flex items-center justify-center p-8 text-center">
          <CardContent>
            <div className="text-muted-foreground text-2xl mb-2">🏷️</div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Attribution Data Unavailable
            </h3>
            <p className="text-xs text-muted-foreground">
              Unable to load cost attribution data.
            </p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center p-8 text-center">
          <CardContent>
            <div className="text-muted-foreground text-2xl mb-2">📈</div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Analysis Unavailable
            </h3>
            <p className="text-xs text-muted-foreground">
              Cannot display cost breakdown.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attributionData = data.attribution;
  const breakdownData = getBreakdownData();

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {/* Left: Attribution Health & Alerts */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <span>Attribution Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 pb-6">
          {/* Coverage Trend */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {attributionData.attributionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1">
                {attributionData.attributionRate >
                attributionData.attributionRatePreviousPeriod ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={`text-2xl font-bold ${
                    attributionData.attributionRate >
                    attributionData.attributionRatePreviousPeriod
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {Math.abs(
                    attributionData.attributionRate -
                      attributionData.attributionRatePreviousPeriod,
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </div>
          </div>

          {/* Health Alerts */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Priority Alerts
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {attributionData.alerts.length > 0 ? (
                attributionData.alerts.map((alert, index) => {
                  const getAlertIcon = () => {
                    switch (alert.type) {
                      case "untagged":
                        return AlertTriangle;
                      case "budget_overrun":
                        return AlertTriangle;
                      case "coverage_drop":
                        return TrendingDown;
                      case "quick_win":
                        return CheckCircle;
                      default:
                        return AlertTriangle;
                    }
                  };

                  const getAlertColor = () => {
                    switch (alert.severity) {
                      case "high":
                        return "text-destructive";
                      case "medium":
                        return "text-warning";
                      case "low":
                        return "text-success";
                      default:
                        return "text-muted-foreground";
                    }
                  };

                  const getBorderColor = () => {
                    switch (alert.severity) {
                      case "high":
                        return "border-destructive/20 bg-destructive/5";
                      case "medium":
                        return "border-warning/20 bg-warning/5";
                      case "low":
                        return "border-success/20 bg-success/5";
                      default:
                        return "border-border bg-secondary/20";
                    }
                  };

                  const AlertIcon = getAlertIcon();

                  return (
                    <div
                      key={`${alert.type}-${index}`}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${getBorderColor()} hover:bg-accent/30 transition-colors`}
                    >
                      <AlertIcon
                        className={`h-4 w-4 mt-0.5 ${getAlertColor()}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        {alert.actionable && (
                          <div className="text-xs text-primary mt-1 font-medium">
                            Action required
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center p-8 text-center">
                  <div>
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium">All Good!</p>
                    <p className="text-xs text-muted-foreground">
                      No attribution issues detected
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Cost Breakdown */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span>Cost Breakdown</span>
            </CardTitle>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === "table" || value === "chart") {
                  setViewMode(value as ViewMode);
                }
              }}
            >
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="chart" aria-label="Chart view">
                <BarChart3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3 pt-2">
            <span className="text-sm font-medium text-muted-foreground">
              Group by:
            </span>
            <Select
              value={selectedBreakdown}
              onValueChange={(value) => {
                setSelectedBreakdown(value as BreakdownType);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {viewMode === "table" ? (
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {breakdownData.length > 0 ? (
                breakdownData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-accent/30 transition-colors mb-3 last:mb-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: generateColor(item.category),
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category === "Unattributed"
                            ? "Unknown instances"
                            : `${item.instanceCount} instance${item.instanceCount !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.cost)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    No attribution data available for this breakdown
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-80 space-y-6">
              {/* Pie Chart */}
              <div className="h-80">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry) => (
                          <Cell key={entry.category} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        animationDuration={0}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover text-popover-foreground border border-border rounded-md px-3 py-2 shadow-md animate-in fade-in-0 duration-150">
                                <p className="font-medium">{label}</p>
                                <p className="text-sm">
                                  {formatCurrency(payload[0].value as number)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        formatter={(value, entry) => (
                          <span className="text-sm text-foreground">
                            {value} (
                            {(
                              ((entry.payload?.value || 0) /
                                pieChartData.reduce(
                                  (sum, item) => sum + item.value,
                                  0,
                                )) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        )}
                        wrapperStyle={{
                          fontSize: "12px",
                          paddingTop: "16px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <p className="text-sm">
                      No attribution data available for this breakdown
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
