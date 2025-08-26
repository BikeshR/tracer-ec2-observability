"use client";

import { useEffect, useState } from "react";
import { type AttributionData, mockAttributionData, type ResearchAttribution, mockResearchAttribution } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, BarChart3, DollarSign, CheckCircle, AlertTriangle, Info } from "lucide-react";

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
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}>
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
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}>
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
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}>
      {/* Left: Team Funding Overview */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>Team Funding Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Attribution Summary */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(attributionData.attributedCost)}
              </div>
              <p className="text-xs text-muted-foreground">Attributed</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {attributionData.attributionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </div>
          </div>

          {/* Grants Table */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Active Grants</div>
            {mockResearchAttribution.grantBreakdown.map((grant) => (
              <div key={grant.grantId} className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">{grant.grantId}</Badge>
                    <span className="text-sm font-medium">{grant.grantName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PI: {grant.piName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(grant.allocatedCost)}</div>
                  <div className="text-xs text-muted-foreground">{grant.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right: Cost Analysis Dashboard */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span>Cost Analysis Dashboard</span>
            </CardTitle>
            <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
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
            <span className="text-sm font-medium text-muted-foreground">Group by:</span>
            <Select value={selectedBreakdown} onValueChange={setSelectedBreakdown}>
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
            <div className="space-y-3">
              {breakdownData.length > 0 ? (
                breakdownData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: `hsl(${(item.category.charCodeAt(0) * 137) % 360}, 70%, 50%)`,
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.instanceCount} instance{item.instanceCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(item.cost)}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No attribution data available for this breakdown</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Chart */}
              <div className="space-y-4">
                {breakdownData.slice(0, 6).map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(${(item.category.charCodeAt(0) * 137) % 360}, 70%, 50%)`,
                          }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <span>{formatCurrency(item.cost)}</span>
                        <span className="text-xs">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-3" />
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-4 h-4 text-accent-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent-foreground">
                      Attribution Insight
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {attributionData.attributionRate > 85
                        ? `Excellent coverage at ${attributionData.attributionRate.toFixed(1)}%`
                        : attributionData.attributionRate > 60
                          ? `Good coverage at ${attributionData.attributionRate.toFixed(1)}%`
                          : `Low coverage at ${attributionData.attributionRate.toFixed(1)}%`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
