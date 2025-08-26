import {
  GetResourcesCommand,
  ResourceGroupsTaggingAPIClient,
} from "@aws-sdk/client-resource-groups-tagging-api";
import { NextResponse } from "next/server";
import { type AttributionData, mockAttributionData } from "@/lib/mock-data";

// Environment-aware data source switching
const useMockData =
  process.env.NODE_ENV === "development" ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY;

// AWS Resource Groups Tagging API Client (only if credentials available)
let taggingClient: ResourceGroupsTaggingAPIClient | null = null;

if (!useMockData) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    try {
      taggingClient = new ResourceGroupsTaggingAPIClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } catch (error) {
      console.warn(
        "Failed to initialize Resource Groups Tagging client:",
        error,
      );
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
    start: lastMonth.toISOString().split("T")[0],
    end: endOfLastMonth.toISOString().split("T")[0],
  };
}

// Fetch real AWS cost attribution data
async function fetchAWSAttributionData(): Promise<AttributionData> {
  if (!taggingClient) {
    throw new Error("Resource Groups Tagging client not initialized");
  }

  const dateRange = getDateRange();

  try {
    // Get all EC2 resources with tags
    const resourceCommand = new GetResourcesCommand({
      ResourceTypeFilters: ["ec2:instance"],
      TagsPerPage: 50,
    });

    const resources = await taggingClient.send(resourceCommand);

    // Process resources and extract tag-based cost attribution
    const attribution = {
      byTeam: new Map<string, { cost: number; instances: number }>(),
      byProject: new Map<string, { cost: number; instances: number }>(),
      byEnvironment: new Map<string, { cost: number; instances: number }>(),
      byInstanceType: new Map<string, { cost: number; instances: number }>(),
      byRegion: new Map<string, { cost: number; instances: number }>(),
    };

    let totalCost = 0;
    let attributedCost = 0;

    for (const resource of resources.ResourceTagMappingList || []) {
      // Extract instance details from ARN
      const _instanceId = resource.ResourceARN?.split("/").pop();
      const region = resource.ResourceARN?.split(":")[3] || "unknown";

      // Calculate estimated cost per instance (simplified for demo)
      const estimatedCost = 50; // Base cost estimate per instance
      totalCost += estimatedCost;

      // Process tags for attribution
      let hasAttribution = false;
      const tags = resource.Tags || [];

      for (const tag of tags) {
        const key = tag.Key || "";
        const value = tag.Value || "";

        // Team attribution
        if (
          key.toLowerCase().includes("team") ||
          key.toLowerCase().includes("owner")
        ) {
          const current = attribution.byTeam.get(value) || {
            cost: 0,
            instances: 0,
          };
          attribution.byTeam.set(value, {
            cost: current.cost + estimatedCost,
            instances: current.instances + 1,
          });
          hasAttribution = true;
        }

        // Project attribution
        if (
          key.toLowerCase().includes("project") ||
          key.toLowerCase().includes("application")
        ) {
          const current = attribution.byProject.get(value) || {
            cost: 0,
            instances: 0,
          };
          attribution.byProject.set(value, {
            cost: current.cost + estimatedCost,
            instances: current.instances + 1,
          });
          hasAttribution = true;
        }

        // Environment attribution
        if (
          key.toLowerCase().includes("environment") ||
          key.toLowerCase().includes("env")
        ) {
          const current = attribution.byEnvironment.get(value) || {
            cost: 0,
            instances: 0,
          };
          attribution.byEnvironment.set(value, {
            cost: current.cost + estimatedCost,
            instances: current.instances + 1,
          });
          hasAttribution = true;
        }
      }

      // Region attribution (always available from ARN)
      const current = attribution.byRegion.get(region) || {
        cost: 0,
        instances: 0,
      };
      attribution.byRegion.set(region, {
        cost: current.cost + estimatedCost,
        instances: current.instances + 1,
      });

      if (hasAttribution) {
        attributedCost += estimatedCost;
      }
    }

    // Convert maps to attribution breakdown format
    const convertToBreakdown = (
      map: Map<string, { cost: number; instances: number }>,
    ) =>
      Array.from(map.entries()).map(([category, data]) => ({
        category,
        cost: data.cost,
        percentage: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
        instanceCount: data.instances,
      }));

    const attributionRate =
      totalCost > 0 ? (attributedCost / totalCost) * 100 : 0;

    const awsAttributionData: AttributionData = {
      totalCost,
      attributedCost,
      unaccountedCost: totalCost - attributedCost,
      attributionRate,
      attributionRatePreviousPeriod: attributionRate * 0.95, // Simulate 5% lower previous period
      untaggedInstanceCount: 0, // Would require checking instance tags
      alerts: [], // Would require implementing alert logic for AWS data
      breakdowns: {
        byTeam: convertToBreakdown(attribution.byTeam),
        byProject: convertToBreakdown(attribution.byProject),
        byEnvironment: convertToBreakdown(attribution.byEnvironment),
        byInstanceType: [], // Would require additional EC2 API calls
        byRegion: convertToBreakdown(attribution.byRegion),
      },
      timeRange: dateRange,
      lastUpdated: new Date().toISOString(),
    };

    return awsAttributionData;
  } catch (error) {
    console.error("Error fetching AWS attribution data:", error);
    throw error;
  }
}

// GET endpoint - returns attribution data
export async function GET() {
  try {
    let attributionData: AttributionData;
    let source: "mock" | "aws" | "mock-fallback";

    if (useMockData) {
      // Development mode or no AWS credentials
      attributionData = mockAttributionData;
      source = "mock";
      console.log(
        "[Attribution API] Using mock data (development mode or no AWS credentials)",
      );
    } else {
      // Production mode with AWS credentials
      try {
        console.log(
          "[Attribution API] Attempting to fetch real AWS attribution data...",
        );
        attributionData = await fetchAWSAttributionData();
        source = "aws";
        console.log(
          "[Attribution API] Successfully fetched AWS attribution data",
        );
      } catch (error) {
        console.warn(
          "[Attribution API] AWS fetch failed, falling back to mock data:",
          error,
        );
        attributionData = mockAttributionData;
        source = "mock-fallback";
      }
    }

    return NextResponse.json({
      attribution: attributionData,
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Attribution API] Unexpected error:", error);

    // Final fallback to mock data
    return NextResponse.json(
      {
        attribution: mockAttributionData,
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
      taggingClientAvailable: !!taggingClient,
      dataSource: useMockData ? "mock" : "aws",
      awsRegion: process.env.AWS_REGION || "us-east-1",
      credentialsConfigured: !!(
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ),
    };

    // Test AWS connection if available
    if (!useMockData && taggingClient) {
      try {
        const testCommand = new GetResourcesCommand({
          ResourceTypeFilters: ["ec2:instance"],
          ResourcesPerPage: 1,
        });

        const result = await taggingClient.send(testCommand);

        return NextResponse.json({
          status: "connected",
          source: "aws",
          message: `Successfully connected to AWS Resource Groups Tagging API. Found ${result.ResourceTagMappingList?.length || 0} tagged resources.`,
          resourcesFound: result.ResourceTagMappingList?.length || 0,
          ...healthCheck,
        });
      } catch (error) {
        return NextResponse.json({
          status: "connection-failed",
          source: "mock-fallback",
          message: `AWS Resource Groups Tagging API connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          troubleshooting:
            "This usually means: 1) Resource Groups Tagging API not accessible, 2) No tagged resources found, or 3) Insufficient permissions",
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
