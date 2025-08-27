"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useFilteredData } from "@/hooks/useFilteredData";
import type { EC2Instance } from "@/lib/mock-data";

interface ApiResponse {
  instances: EC2Instance[];
  source: "mock" | "aws" | "mock-fallback" | "error";
  timestamp: string;
  error?: string;
}

type SortField =
  | "name"
  | "instanceType"
  | "cpuUtilization"
  | "memoryUtilization"
  | "gpuUtilization"
  | "uptime"
  | "costPerHour"
  | "state"
  | "efficiencyScore"
  | "wasteLevel"
  | "jobId";
type SortDirection = "asc" | "desc";

export default function EC2Table() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("wasteLevel");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // Load from localStorage or default to 25
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ec2-table-page-size");
      return saved ? parseInt(saved, 10) : 25;
    }
    return 25;
  });

  const { dataSource } = useDataSource();

  // Fetch EC2 data
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const url = new URL("/api/instances", window.location.origin);
        url.searchParams.set("dataSource", dataSource);

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API Error: ${response.status}`);
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
  }, [dataSource]);

  // Transform instances for filtering (map tags.Team to team field)
  const instancesForFiltering =
    data?.instances?.map((instance) => ({
      ...instance,
      team: instance.tags?.Team,
      region: instance.region,
    })) || [];

  // Apply filters
  const { filteredData: filteredInstances } = useFilteredData(
    instancesForFiltering,
  );

  // Sort filtered instances
  const sortedInstances =
    filteredInstances.length > 0
      ? [...filteredInstances].sort((a, b) => {
          let aValue: string | number;
          let bValue: string | number;

          // Handle special sorting cases
          if (sortField === "wasteLevel") {
            const wasteOrder = { high: 3, medium: 2, low: 1 };
            aValue = wasteOrder[a.wasteLevel];
            bValue = wasteOrder[b.wasteLevel];
          } else if (sortField === "uptime") {
            aValue = a.uptimeHours;
            bValue = b.uptimeHours;
          } else {
            // Safe property access for sortable fields
            switch (sortField) {
              case "name":
                aValue = a.name;
                bValue = b.name;
                break;
              case "instanceType":
                aValue = a.instanceType;
                bValue = b.instanceType;
                break;
              case "cpuUtilization":
                aValue = a.cpuUtilization;
                bValue = b.cpuUtilization;
                break;
              case "memoryUtilization":
                aValue = a.memoryUtilization;
                bValue = b.memoryUtilization;
                break;
              case "gpuUtilization":
                aValue = a.gpuUtilization;
                bValue = b.gpuUtilization;
                break;
              case "costPerHour":
                aValue = a.costPerHour;
                bValue = b.costPerHour;
                break;
              case "state":
                aValue = a.state;
                bValue = b.state;
                break;
              case "efficiencyScore":
                aValue = a.efficiencyScore;
                bValue = b.efficiencyScore;
                break;
              case "jobId":
                aValue = a.jobId || "";
                bValue = b.jobId || "";
                break;
              default:
                aValue = 0;
                bValue = 0;
            }
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

  // Pagination calculations
  const totalItems = sortedInstances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedInstances = sortedInstances.slice(startIndex, endIndex);

  // Reset to first page when filtering/sorting/page size changes
  useEffect(() => {
    if (filteredInstances.length || sortField || sortDirection || itemsPerPage)
      setCurrentPage(1);
  }, [filteredInstances.length, sortField, sortDirection, itemsPerPage]);

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize, 10);
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("ec2-table-page-size", newSize);
    }
  };

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
  const getWasteLevelStyling = (wasteLevel: "low" | "medium" | "high") => {
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
          badgeClass: "bg-warning/10 text-warning border border-warning/20",
          icon: "🟡",
          label: "Medium Waste",
        };
      case "low":
        return {
          bgClass: "bg-success/10",
          textClass: "text-success",
          badgeClass: "bg-success/10 text-success border border-success/20",
          icon: "🟢",
          label: "Efficient",
        };
    }
  };

  // Get utilization styling
  const getUtilizationStyling = (utilization: number) => {
    if (utilization < 20) return "text-destructive font-semibold";
    if (utilization < 60) return "text-warning font-medium";
    return "text-success font-semibold";
  };

  // Get utilization bar component
  const UtilizationBar = ({
    utilization,
    type,
  }: {
    utilization: number;
    type: string;
  }) => (
    <div className="flex items-center space-x-2">
      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            utilization < 20
              ? "bg-destructive"
              : utilization < 60
                ? "bg-warning"
                : "bg-success"
          }`}
          style={{ width: `${Math.min(100, utilization)}%` }}
        />
      </div>
      <div
        className={`text-sm font-medium ${getUtilizationStyling(utilization)} min-w-[3rem]`}
      >
        {type === "gpu" && utilization === 0
          ? "—"
          : `${utilization.toFixed(1)}%`}
      </div>
    </div>
  );

  // Format uptime helper
  const formatUptime = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    if (hours < 168) return `${Math.floor(hours / 24)}d`;
    return `${Math.floor(hours / 168)}w`;
  };

  // Legacy state styling function - kept for potential custom styling needs
  // const getStateStyling = (state: string) => {
  //   switch (state.toLowerCase()) {
  //     case "running":
  //       return "bg-emerald-500/10 text-emerald-500 border border-success/20";
  //     case "stopped":
  //       return "bg-tracer-bg-tertiary text-tracer-text-secondary border border-tracer-border";
  //     case "pending":
  //       return "bg-tracer-info/10 text-tracer-info border border-tracer-info/20";
  //     case "shutting-down":
  //     case "stopping":
  //       return "bg-yellow-500/10 text-yellow-500 border border-warning/20";
  //     case "terminated":
  //       return "bg-red-500/10 text-red-500 border border-red-500/20";
  //     default:
  //       return "bg-tracer-bg-tertiary text-tracer-text-muted border border-tracer-border";
  //   }
  // };

  // Get Badge variant for instance state
  const getStateVariant = (
    state: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (state.toLowerCase()) {
      case "running":
        return "default";
      case "stopped":
        return "secondary";
      case "pending":
        return "outline"; // Neutral for transitional state
      case "stopping":
        return "outline"; // Neutral for transitional state
      case "terminated":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get Badge variant for waste level
  const getWasteVariant = (
    wasteLevel: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (wasteLevel) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary"; // Better visual styling than outline
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
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("jobId")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Job
                    {sortField === "jobId" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("cpuUtilization")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    CPU
                    {sortField === "cpuUtilization" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("memoryUtilization")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Memory
                    {sortField === "memoryUtilization" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("gpuUtilization")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    GPU
                    {sortField === "gpuUtilization" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("uptime")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Uptime
                    {sortField === "uptime" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("costPerHour")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Hourly Cost
                    {sortField === "costPerHour" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("state")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Status
                    {sortField === "state" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("efficiencyScore")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Score
                    {sortField === "efficiencyScore" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("wasteLevel")}
                    className="h-auto px-2 py-1 font-medium hover:bg-transparent hover:text-muted-foreground justify-start"
                  >
                    Resource Health
                    {sortField === "wasteLevel" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInstances.map((instance) => {
                const wasteStyling = getWasteLevelStyling(instance.wasteLevel);

                return (
                  <TableRow key={instance.instanceId}>
                    {/* Instance Info */}
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium text-foreground">
                          {instance.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {instance.instanceType} • {instance.instanceId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {instance.region}
                        </div>
                      </div>
                    </TableCell>

                    {/* Job Info */}
                    <TableCell>
                      {instance.jobId ? (
                        <div className="flex flex-col">
                          <Badge
                            variant="outline"
                            className="w-fit bg-blue-500/5 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-800"
                          >
                            {instance.jobId}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">
                          No job assigned
                        </div>
                      )}
                    </TableCell>

                    {/* CPU Utilization */}
                    <TableCell>
                      <UtilizationBar
                        utilization={instance.cpuUtilization}
                        type="cpu"
                      />
                    </TableCell>

                    {/* Memory Utilization */}
                    <TableCell>
                      <UtilizationBar
                        utilization={instance.memoryUtilization}
                        type="memory"
                      />
                    </TableCell>

                    {/* GPU Utilization */}
                    <TableCell>
                      <UtilizationBar
                        utilization={instance.gpuUtilization}
                        type="gpu"
                      />
                    </TableCell>

                    {/* Uptime */}
                    <TableCell>
                      <div className="text-sm font-medium text-foreground">
                        {formatUptime(instance.uptimeHours)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {instance.uptimeHours}h total
                      </div>
                    </TableCell>

                    {/* Cost */}
                    <TableCell>
                      <div className="text-sm text-foreground font-medium">
                        ${instance.costPerHour.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${instance.monthlyCost.toFixed(2)}/month
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={getStateVariant(instance.state)}
                        className={
                          instance.state.toLowerCase() === "pending"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : instance.state.toLowerCase() === "stopping"
                              ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                              : instance.state.toLowerCase() === "running"
                                ? "bg-success/10 text-success border-success/20"
                                : ""
                        }
                      >
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

                    {/* Resource Health */}
                    <TableCell>
                      <Badge
                        variant={getWasteVariant(instance.wasteLevel)}
                        className={
                          instance.wasteLevel === "medium"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : instance.wasteLevel === "low"
                              ? "bg-success/10 text-success border-success/20"
                              : ""
                        }
                      >
                        {wasteStyling.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="px-6 py-3 border-t border-border bg-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-xs text-muted-foreground">
                  Showing {startIndex + 1}-{endIndex} of {totalItems} instances
                </div>
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Show:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="h-7 w-16 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber =
                        currentPage <= 3
                          ? i + 1
                          : currentPage >= totalPages - 2
                            ? totalPages - 4 + i
                            : currentPage - 2 + i;

                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={
                              pageNumber === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="h-8 w-8 p-0 text-xs"
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Stats */}
          <div className="px-6 py-3 bg-secondary border-t border-border text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <div>
                Total: {data.instances.length} instances (
                {sortedInstances.filter((i) => i.state === "running").length}{" "}
                running)
              </div>
              <div>
                🔴 High Waste:{" "}
                {sortedInstances.filter((i) => i.wasteLevel === "high").length}{" "}
                • 🟡 Medium:{" "}
                {
                  sortedInstances.filter((i) => i.wasteLevel === "medium")
                    .length
                }{" "}
                • 🟢 Efficient:{" "}
                {sortedInstances.filter((i) => i.wasteLevel === "low").length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
