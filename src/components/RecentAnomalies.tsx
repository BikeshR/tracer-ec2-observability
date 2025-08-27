"use client";

import {
  AlertTriangle,
  Calendar,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Anomaly {
  date: string;
  expectedCost: number;
  actualCost: number;
}

interface RecentAnomaliesProps {
  anomalies: Anomaly[];
}

export default function RecentAnomalies({ anomalies }: RecentAnomaliesProps) {
  // Process anomalies with impact analysis
  const processedAnomalies = useMemo(() => {
    return anomalies
      .map((anomaly) => {
        const impact = anomaly.actualCost - anomaly.expectedCost;
        const impactPercent = Number(
          ((impact / anomaly.expectedCost) * 100).toFixed(1),
        );
        const severity =
          Math.abs(impactPercent) >= 30
            ? "high"
            : Math.abs(impactPercent) >= 15
              ? "medium"
              : "low";

        return {
          ...anomaly,
          impact,
          impactPercent,
          severity,
          date: new Date(anomaly.date),
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Most recent first
      .slice(0, 3); // Show only the 3 most recent
  }, [anomalies]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  // Get severity background
  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 border-orange-500/20";
      case "low":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "bg-muted/10 border-border/20";
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (processedAnomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Recent Anomalies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent anomalies detected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span>Recent Anomalies</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last {processedAnomalies.length} incidents
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {processedAnomalies.map((anomaly, index) => (
            <div
              key={`${anomaly.date.toISOString()}-${index}`}
              className={`p-3 rounded-lg border ${getSeverityBg(anomaly.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {anomaly.impact > 0 ? (
                      <TrendingUp
                        className={`h-3 w-3 ${getSeverityColor(anomaly.severity)}`}
                      />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-600" />
                    )}
                    <span className="text-sm font-medium">
                      {anomaly.impact > 0 ? "Cost Spike" : "Cost Drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(anomaly.date)}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    Expected: {formatCurrency(anomaly.expectedCost)} → Actual:{" "}
                    {formatCurrency(anomaly.actualCost)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-semibold ${getSeverityColor(anomaly.severity)}`}
                    >
                      {anomaly.impact > 0 ? "+" : ""}
                      {Math.abs(anomaly.impactPercent)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({anomaly.impact > 0 ? "+" : ""}
                      {formatCurrency(anomaly.impact)} impact)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary Footer */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Average Impact:</span>
              <span className="font-medium">
                {Number(
                  (
                    processedAnomalies.reduce(
                      (sum, a) => sum + Math.abs(a.impactPercent),
                      0,
                    ) / processedAnomalies.length
                  ).toFixed(1),
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
