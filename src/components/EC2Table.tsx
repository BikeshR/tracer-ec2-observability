"use client";

import { useEffect, useState } from "react";
import type { EC2Instance } from "@/lib/mock-data";
import { useFilteredData } from "@/hooks/useFilteredData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Server } from "lucide-react";

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
  | "memoryUtilization"
  | "costPerHour"
  | "state"
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

  // Transform instances for filtering (map tags.Team to team field)
  const instancesForFiltering =
    data?.instances?.map((instance) => ({
      ...instance,
      team: instance.tags?.Team,
      region: instance.region,
    })) || [];

  // Apply filters
  const {
    filteredData: filteredInstances,
    totalCount,
    filteredCount,
  } = useFilteredData(instancesForFiltering);

  // Sort filtered instances
  const sortedInstances =
    filteredInstances.length > 0
      ? [...filteredInstances].sort((a, b) => {
          let aValue: string | number = a[sortField];
          let bValue: string | number = b[sortField];

          // Handle waste level sorting
          if (sortField === "wasteLevel") {
            const wasteOrder = { high: 3, medium: 2, low: 1 };
            aValue = wasteOrder[a.wasteLevel];
            bValue = wasteOrder[b.wasteLevel];
          }

          // Handle string vs number comparison
          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = (bValue as string).toLowerCase();
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
    _efficiencyScore: number,
  ) => {
    switch (wasteLevel) {
      case "high":
        return {
          bgClass: "bg-destructive/10",
          textClass: "text-destructive",
          badgeClass:
            "bg-destructive/10 text-destructive border border-destructive/20",
          icon: "🔴",
          label: "High Waste",
        };
      case "medium":
        return {
          bgClass: "bg-warning/10",
          textClass: "text-warning",
          badgeClass:
            "bg-warning/10 text-warning border border-warning/20",
          icon: "🟡",
          label: "Medium Waste",
        };
      case "low":
        return {
          bgClass: "bg-emerald-500/10",
          textClass: "text-emerald-500",
          badgeClass:
            "bg-emerald-500/10 text-emerald-500 border border-tracer-success/20",
          icon: "🟢",
          label: "Efficient",
        };
    }
  };

  // Get utilization styling
  const getUtilizationStyling = (utilization: number) => {
    if (utilization < 20) return "text-destructive font-semibold";
    if (utilization < 60) return "text-warning font-medium";
    return "text-emerald-500 font-semibold";
  };

  // Legacy state styling function - kept for potential custom styling needs
  // const getStateStyling = (state: string) => {
  //   switch (state.toLowerCase()) {
  //     case "running":
  //       return "bg-emerald-500/10 text-emerald-500 border border-tracer-success/20";
  //     case "stopped":
  //       return "bg-tracer-bg-tertiary text-tracer-text-secondary border border-tracer-border";
  //     case "pending":
  //       return "bg-tracer-info/10 text-tracer-info border border-tracer-info/20";
  //     case "shutting-down":
  //     case "stopping":
  //       return "bg-yellow-500/10 text-yellow-500 border border-tracer-warning/20";
  //     case "terminated":
  //       return "bg-red-500/10 text-red-500 border border-red-500/20";
  //     default:
  //       return "bg-tracer-bg-tertiary text-tracer-text-muted border border-tracer-border";
  //   }
  // };

  // Get Badge variant for instance state
  const getStateVariant = (state: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (state.toLowerCase()) {
      case "running":
        return "default";
      case "stopped":
        return "secondary";
      case "terminated":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get Badge variant for waste level
  const getWasteVariant = (wasteLevel: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (wasteLevel) {
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      case "low":
        return "default";
      default:
        return "secondary";
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
        <p className="text-center text-muted-foreground mt-4">
          Loading EC2 instances...
        </p>
      </Card>
    );
  }

  // Error state - use danger surface for error indication
  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Failed to Load EC2 Data
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </Card>
    );
  }

  // No data state - use neutral elevated surface
  if (!data || !data.instances || data.instances.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No EC2 Instances Found
        </h3>
        <p className="text-muted-foreground">
          {data?.source === "aws"
            ? "No EC2 instances found in your AWS account."
            : "No instance data available."}
        </p>
      </Card>
    );
  }

  return (
    <Card className="mb-8 pb-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          <span>EC2 Instances</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  Instance
                  {sortField === "name" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("cpuUtilization")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  CPU Usage
                  {sortField === "cpuUtilization" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("memoryUtilization")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  Memory %
                  {sortField === "memoryUtilization" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("costPerHour")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  Cost/Hour
                  {sortField === "costPerHour" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("state")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  State
                  {sortField === "state" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("efficiencyScore")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  Efficiency
                  {sortField === "efficiencyScore" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("wasteLevel")}
                  className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                >
                  Waste Alert
                  {sortField === "wasteLevel" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInstances.map((instance) => {
              const wasteStyling = getWasteLevelStyling(
                instance.wasteLevel,
                instance.efficiencyScore,
              );

              return (
                <TableRow
                  key={instance.instanceId}
                >
                  {/* Instance Info */}
                  <TableCell>
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
                  </TableCell>

                  {/* CPU Utilization */}
                  <TableCell>
                    <div
                      className={`text-sm font-medium ${getUtilizationStyling(instance.cpuUtilization)}`}
                    >
                      {instance.cpuUtilization.toFixed(1)}%
                    </div>
                  </TableCell>

                  {/* Memory Utilization */}
                  <TableCell>
                    <div
                      className={`text-sm font-medium ${getUtilizationStyling(instance.memoryUtilization)}`}
                    >
                      {instance.memoryUtilization.toFixed(1)}%
                    </div>
                  </TableCell>

                  {/* Cost */}
                  <TableCell>
                    <div className="text-sm text-tracer-text-primary font-medium">
                      ${instance.costPerHour.toFixed(4)}
                    </div>
                    <div className="text-xs text-tracer-text-secondary">
                      ${instance.monthlyCost.toFixed(2)}/month
                    </div>
                  </TableCell>

                  {/* State */}
                  <TableCell>
                    <Badge variant={getStateVariant(instance.state)}>
                      {instance.state}
                    </Badge>
                  </TableCell>

                  {/* Efficiency Score */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`text-sm font-semibold ${wasteStyling.textClass}`}
                      >
                        {instance.efficiencyScore}/100
                      </div>
                    </div>
                  </TableCell>

                  {/* Waste Alert */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{wasteStyling.icon}</span>
                      <div>
                        <Badge variant={getWasteVariant(instance.wasteLevel)}>
                          {wasteStyling.label}
                        </Badge>
                        {instance.wasteLevel === "high" && (
                          <div className="text-xs text-destructive mt-1">
                            💰 Potential savings available
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-secondary border-t border-border text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
