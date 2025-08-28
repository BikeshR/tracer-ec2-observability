"use client";

import { AlertTriangle, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CostTrendPoint } from "@/lib/mock-data";

interface ResearchCostTrendProps {
  data: CostTrendPoint[];
  weeklyEfficiencyScore: number;
}

export default function ResearchCostTrend({
  data,
  weeklyEfficiencyScore,
}: ResearchCostTrendProps) {
  // Calculate chart dimensions
  const maxCost = Math.max(
    ...data.map((d) => Math.max(d.actualCost, d.baselineCost)),
  );
  const chartHeight = 120;
  const chartWidth = 280;
  const padding = 20;

  // Generate SVG path for baseline
  const generatePath = (points: number[], _isBaseline: boolean = false) => {
    const width = chartWidth - padding * 2;
    const height = chartHeight - padding * 2;

    // Handle zero-cost scenario
    if (maxCost === 0) {
      // Draw a flat line at the bottom for zero costs
      const y = padding + height;
      const pathData = points
        .map((_cost, index) => {
          const x = padding + (index / (points.length - 1)) * width;
          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ");

      const lastX = padding + width;
      const firstX = padding;
      const bottomY = padding + height;
      return `${pathData} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    }

    const pathData = points
      .map((cost, index) => {
        const x = padding + (index / (points.length - 1)) * width;
        const y = padding + height - (cost / maxCost) * height;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    // Close the path for area fill
    const lastX = padding + width;
    const firstX = padding;
    const bottomY = padding + height;

    return `${pathData} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const baselinePath = generatePath(
    data.map((d) => d.baselineCost),
    true,
  );
  const actualPath = generatePath(
    data.map((d) => d.actualCost),
    false,
  );

  // Get pattern color
  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case "efficient":
        return "#10b981"; // Green
      case "research_activity":
        return "#3b82f6"; // Blue
      case "wasteful":
        return "#f59e0b"; // Yellow/Orange
      case "idle":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  // Get efficiency grade
  const getEfficiencyGrade = (
    score: number,
  ): { grade: string; color: string } => {
    if (score >= 90) return { grade: "A", color: "text-green-600" };
    if (score >= 80) return { grade: "B", color: "text-blue-600" };
    if (score >= 70) return { grade: "C", color: "text-yellow-600" };
    if (score >= 60) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  // Get pattern insights
  const getPatternInsights = () => {
    const patterns = data.reduce(
      (acc, point) => {
        acc[point.pattern] = (acc[point.pattern] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalDays = data.length;
    const insights = [];

    if (patterns.wasteful >= 2) {
      insights.push({
        icon: AlertTriangle,
        text: `${patterns.wasteful} days with inefficient usage`,
        color: "text-orange-600",
      });
    }

    if (patterns.idle >= 1) {
      insights.push({
        icon: AlertTriangle,
        text: `${patterns.idle} days with idle resources`,
        color: "text-red-600",
      });
    }

    if (patterns.efficient >= Math.floor(totalDays * 0.6)) {
      insights.push({
        icon: CheckCircle,
        text: "Good efficiency most days",
        color: "text-green-600",
      });
    }

    return insights.slice(0, 2); // Show max 2 insights
  };

  const { grade, color } = getEfficiencyGrade(weeklyEfficiencyScore);
  const insights = getPatternInsights();
  const formatCurrency = (amount: number) => `$${Math.round(amount)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Research Cost Pattern</span>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className={`text-lg font-bold ${color}`}>{grade}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* SVG Chart */}
          <div className="relative">
            <svg width={chartWidth} height={chartHeight} className="mx-auto">
              <title>7-day research cost trend pattern chart</title>
              {/* Grid lines */}
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Baseline area (expected research pattern) */}
              <path
                d={baselinePath}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="1"
                strokeDasharray="4,2"
              />

              {/* Actual cost area with pattern-based coloring */}
              <path
                d={actualPath}
                fill="rgba(34, 197, 94, 0.2)"
                stroke="rgba(34, 197, 94, 0.8)"
                strokeWidth="2"
              />

              {/* Data points with pattern colors */}
              {data.map((point, index) => {
                const width = chartWidth - padding * 2;
                const height = chartHeight - padding * 2;
                const x = padding + (index / (data.length - 1)) * width;

                // Handle zero-cost scenario to prevent NaN
                const y =
                  maxCost === 0
                    ? padding + height // Place at bottom for zero costs
                    : padding + height - (point.actualCost / maxCost) * height;

                return (
                  <g key={point.date}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={getPatternColor(point.pattern)}
                      stroke="white"
                      strokeWidth="1"
                      className="hover:r-6 cursor-pointer transition-all"
                    >
                      <title>{`${new Date(point.date).toLocaleDateString()}: ${formatCurrency(point.actualCost)} (${point.annotation})`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500/50 rounded"></div>
                <span>Expected</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
                <span>Actual</span>
              </div>
            </div>
          </div>

          {/* Pattern Insights */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Week Overview:</div>
            {insights.length > 0 ? (
              <div className="space-y-1">
                {insights.map((insight, index) => (
                  <div
                    key={`${insight.text}-${index}`}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <insight.icon className={`h-3 w-3 ${insight.color}`} />
                    <span className="text-muted-foreground">
                      {insight.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-muted-foreground">
                  Balanced research activity pattern
                </span>
              </div>
            )}

            {/* Efficiency Score */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Weekly Efficiency:
                </span>
                <span className={`font-semibold ${color}`}>
                  {weeklyEfficiencyScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
