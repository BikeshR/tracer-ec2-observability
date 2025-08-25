import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";
import {
  calculateEfficiencyScore,
  determineWasteLevel,
  mockEC2Instances,
  type EC2Instance,
} from "@/lib/mock-data";
import { NextResponse } from "next/server";

// EC2 client setup (only used in production)
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Transform AWS EC2 response to our standardized format
function transformAWSInstance(instance: any): EC2Instance {
  const name =
    instance.Tags?.find((tag: any) => tag.Key === "Name")?.Value ||
    "Unnamed Instance";
  const tags = Object.fromEntries(
    instance.Tags?.map((tag: any) => [tag.Key, tag.Value]) || [],
  );

  // Mock metrics for now - will replace with real CloudWatch data later
  const cpuUtilization = Math.random() * 100;
  const memoryUtilization = Math.random() * 100;
  const efficiencyScore = calculateEfficiencyScore(
    cpuUtilization,
    memoryUtilization,
    0.0116,
  );

  return {
    instanceId: instance.InstanceId,
    name,
    instanceType: instance.InstanceType,
    state: instance.State?.Name || "unknown",
    launchTime: instance.LaunchTime?.toISOString() || "",
    region: process.env.AWS_REGION || "us-east-1",
    cpuUtilization,
    memoryUtilization,
    networkIn: Math.random() * 5,
    networkOut: Math.random() * 3,
    costPerHour: 0.0116, // t2.micro pricing - will be dynamic later
    monthlyCost: 0.0116 * 24 * 30,
    tags,
    efficiencyScore,
    wasteLevel: determineWasteLevel(efficiencyScore),
  };
}

export async function GET() {
  try {
    // Use mock data in development or when AWS credentials are not available
    const useMockData =
      process.env.NODE_ENV === "development" ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY;

    if (useMockData) {
      console.log("🔧 Using mock EC2 data for development");
      return NextResponse.json({
        instances: mockEC2Instances,
        source: "mock",
        timestamp: new Date().toISOString(),
      });
    }

    // Real AWS integration
    console.log("🔗 Fetching real EC2 data from AWS...");
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    // Transform AWS response
    const instances: EC2Instance[] = [];
    for (const reservation of response.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        instances.push(transformAWSInstance(instance));
      }
    }

    console.log(`✅ Found ${instances.length} EC2 instances`);

    return NextResponse.json({
      instances,
      source: "aws",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ EC2 API Error:", error);

    // Graceful fallback to mock data
    console.log("🔄 Falling back to mock data due to AWS error");
    return NextResponse.json({
      instances: mockEC2Instances,
      source: "mock-fallback",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown AWS error",
    });
  }
}

// Health check endpoint for testing AWS connection
export async function POST() {
  try {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        status: "ok",
        message: "Development mode - AWS connection not tested",
        mockDataAvailable: true,
      });
    }

    // Test AWS connection
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    return NextResponse.json({
      status: "ok",
      message: "AWS connection successful",
      instanceCount: response.Reservations?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "AWS connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        fallbackAvailable: true,
      },
      { status: 500 },
    );
  }
}
