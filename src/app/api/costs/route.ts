import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetDimensionValuesCommand,
} from "@aws-sdk/client-cost-explorer";
import { NextResponse } from "next/server";
import { type CostData, mockCostData } from "@/lib/mock-data";

// Environment-aware data source switching
const useMockData =
  process.env.NODE_ENV === "development" ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY;

// AWS Cost Explorer Client (only if credentials available)
let costExplorerClient: CostExplorerClient | null = null;

if (!useMockData) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    try {
      costExplorerClient = new CostExplorerClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } catch (error) {
      console.warn("Failed to initialize Cost Explorer client:", error);
    }
  }
}

// Helper function to get date range for cost queries
function getDateRange() {
  const today = new Date();
  // Use previous month's data to ensure availability (Cost Explorer has 24-48h delay)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    Start: lastMonth.toISOString().split("T")[0],
    End: endOfLastMonth.toISOString().split("T")[0],
  };
}

// Fetch real AWS cost data
async function fetchAWSCostData(): Promise<CostData> {
  if (!costExplorerClient) {
    throw new Error("Cost Explorer client not initialized");
  }

  const dateRange = getDateRange();

  try {
    // Get overall cost and usage
    const costAndUsageCommand = new GetCostAndUsageCommand({
      TimePeriod: dateRange,
      Granularity: "DAILY",
      Metrics: ["BlendedCost", "UsageQuantity"],
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "SERVICE",
        },
      ],
    });

    const costResponse = await costExplorerClient.send(costAndUsageCommand);

    // Get cost by environment (using tags if available, otherwise mock structure)
    const costByEnvironment = mockCostData.costByEnvironment; // Fallback to mock structure
    const costByTeam = mockCostData.costByTeam; // Fallback to mock structure

    // Calculate totals from AWS response
    let totalMonthlyCost = 0;
    const costTrend: { date: string; cost: number }[] = [];

    if (costResponse.ResultsByTime) {
      for (const result of costResponse.ResultsByTime) {
        const dailyCost = parseFloat(result.Total?.BlendedCost?.Amount || "0");
        totalMonthlyCost += dailyCost;

        if (result.TimePeriod?.Start) {
          costTrend.push({
            date: result.TimePeriod.Start,
            cost: dailyCost,
          });
        }
      }
    }

    // Calculate other metrics
    const dailyBurnRate = totalMonthlyCost / new Date().getDate();
    const projectedMonthlyCost = dailyBurnRate * 30; // Project for full month

    // Structure real AWS data to match our CostData interface
    const awsCostData: CostData = {
      totalMonthlyCost,
      dailyBurnRate,
      projectedMonthlyCost,
      costByTeam, // Using mock structure (tags would require more complex query)
      costByEnvironment, // Using mock structure (tags would require more complex query)
      costByRegion: [
        {
          region: process.env.AWS_REGION || "us-east-1",
          cost: totalMonthlyCost,
        },
      ],
      unattributedCost: 0,
      costTrend: costTrend.length > 0 ? costTrend : mockCostData.costTrend,
      anomalies: mockCostData.anomalies, // Would require separate anomaly detection API
    };

    return awsCostData;
  } catch (error) {
    console.error("Error fetching AWS cost data:", error);
    throw error;
  }
}

// GET endpoint - returns cost data
export async function GET() {
  try {
    let costData: CostData;
    let source: "mock" | "aws" | "mock-fallback";

    if (useMockData) {
      // Development mode or no AWS credentials
      costData = mockCostData;
      source = "mock";
      console.log(
        "[Cost API] Using mock data (development mode or no AWS credentials)",
      );
    } else {
      // Production mode with AWS credentials
      try {
        console.log("[Cost API] Attempting to fetch real AWS cost data...");
        costData = await fetchAWSCostData();
        source = "aws";
        console.log("[Cost API] Successfully fetched AWS cost data");
      } catch (error) {
        console.warn(
          "[Cost API] AWS fetch failed, falling back to mock data:",
          error,
        );
        costData = mockCostData;
        source = "mock-fallback";
      }
    }

    return NextResponse.json({
      costs: costData,
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cost API] Unexpected error:", error);

    // Final fallback to mock data
    return NextResponse.json(
      {
        costs: mockCostData,
        source: "mock-fallback",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST endpoint - health check
export async function POST() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      costExplorerAvailable: !!costExplorerClient,
      dataSource: useMockData ? "mock" : "aws",
      awsRegion: process.env.AWS_REGION || "us-east-1",
      credentialsConfigured: !!(
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ),
    };

    // Test AWS connection if available
    if (!useMockData && costExplorerClient) {
      try {
        const dateRange = getDateRange();
        console.log(
          `[Cost API] Testing date range: ${dateRange.Start} to ${dateRange.End}`,
        );

        const testCommand = new GetDimensionValuesCommand({
          TimePeriod: dateRange,
          Dimension: "SERVICE",
        });

        const result = await costExplorerClient.send(testCommand);

        return NextResponse.json({
          status: "connected",
          source: "aws",
          message: `Successfully connected to AWS Cost Explorer. Found ${result.DimensionValues?.length || 0} services with cost data.`,
          dateRange,
          servicesFound: result.DimensionValues?.length || 0,
          ...healthCheck,
        });
      } catch (error) {
        const dateRange = getDateRange();
        return NextResponse.json({
          status: "connection-failed",
          source: "mock-fallback",
          message: `AWS Cost Explorer connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          dateRange,
          troubleshooting:
            "This usually means: 1) Cost Explorer not enabled in AWS Console, 2) No billing data for this time period, or 3) Account too new",
          ...healthCheck,
        });
      }
    }

    return NextResponse.json({
      status: "mock-mode",
      source: "mock",
      message: useMockData
        ? "Running in development mode with mock data"
        : "No AWS credentials configured",
      ...healthCheck,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        source: "unknown",
        message: `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
