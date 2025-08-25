// Mock data that matches AWS EC2 API structure for development

export interface EC2Instance {
  instanceId: string;
  name: string;
  instanceType: string;
  state: string;
  launchTime: string;
  region: string;
  // Metrics (will be real CloudWatch data later)
  cpuUtilization: number;
  memoryUtilization: number;
  networkIn: number;
  networkOut: number;
  // Cost data
  costPerHour: number;
  monthlyCost: number;
  // Tags for cost attribution
  tags: { [key: string]: string };
  // Calculated fields
  efficiencyScore: number;
  wasteLevel: "low" | "medium" | "high";
}

export const mockEC2Instances: EC2Instance[] = [
  {
    instanceId: "i-zombie123456789",
    name: "Tracer-Zombie-Server",
    instanceType: "t2.micro",
    state: "running",
    launchTime: "2024-01-15T10:00:00Z",
    region: "us-east-1",
    // Very low utilization - classic "zombie" server
    cpuUtilization: 2.1,
    memoryUtilization: 15.3,
    networkIn: 0.05,
    networkOut: 0.03,
    costPerHour: 0.0116,
    monthlyCost: 8.35,
    tags: {
      Name: "Tracer-Zombie-Server",
      Purpose: "Low-utilization-demo",
      Owner: "Assessment",
      Environment: "Test",
      Team: "Research-A",
    },
    efficiencyScore: 15, // Very inefficient
    wasteLevel: "high",
  },
  {
    instanceId: "i-efficient987654321",
    name: "Tracer-Efficient-Server",
    instanceType: "t2.micro",
    state: "running",
    launchTime: "2024-01-15T10:30:00Z",
    region: "us-east-1",
    // Good utilization - well-optimized
    cpuUtilization: 65.8,
    memoryUtilization: 72.4,
    networkIn: 2.8,
    networkOut: 1.9,
    costPerHour: 0.0116,
    monthlyCost: 8.35,
    tags: {
      Name: "Tracer-Efficient-Server",
      Purpose: "Well-optimized-demo",
      Owner: "Assessment",
      Environment: "Production",
      Team: "Research-B",
    },
    efficiencyScore: 85, // Very efficient
    wasteLevel: "low",
  },
  {
    instanceId: "i-overprovisioned555",
    name: "Tracer-Overprovisioned-Server",
    instanceType: "t2.micro",
    state: "running",
    launchTime: "2024-01-15T11:15:00Z",
    region: "us-east-1",
    // Moderate utilization but could be smaller instance
    cpuUtilization: 25.4,
    memoryUtilization: 30.1,
    networkIn: 0.8,
    networkOut: 0.6,
    costPerHour: 0.0116,
    monthlyCost: 8.35,
    tags: {
      Name: "Tracer-Overprovisioned-Server",
      Purpose: "Over-provisioned-demo",
      Owner: "Assessment",
      Environment: "Development",
      Team: "Research-C",
    },
    efficiencyScore: 45, // Could be optimized
    wasteLevel: "medium",
  },
  {
    instanceId: "i-stopped777888999",
    name: "Tracer-Stopped-Server",
    instanceType: "t2.micro",
    state: "stopped",
    launchTime: "2024-01-10T14:20:00Z",
    region: "us-east-1",
    // Stopped instance - no current utilization
    cpuUtilization: 0,
    memoryUtilization: 0,
    networkIn: 0,
    networkOut: 0,
    costPerHour: 0,
    monthlyCost: 0,
    tags: {
      Name: "Tracer-Stopped-Server",
      Purpose: "Stopped-demo",
      Owner: "Assessment",
      Environment: "Test",
      Team: "Research-A",
    },
    efficiencyScore: 0,
    wasteLevel: "low", // Not wasting if stopped
  },
];

// Cost data for cost attribution and overview components
export interface CostData {
  totalMonthlyCost: number;
  dailyBurnRate: number;
  projectedMonthlyCost: number;
  costByTeam: { team: string; cost: number }[];
  costByEnvironment: { environment: string; cost: number }[];
  costByRegion: { region: string; cost: number }[];
  unattributedCost: number;
  costTrend: { date: string; cost: number }[];
  anomalies: { date: string; expectedCost: number; actualCost: number }[];
}

export const mockCostData: CostData = {
  totalMonthlyCost: 25.05, // 3 running instances × $8.35
  dailyBurnRate: 0.83,
  projectedMonthlyCost: 25.73,
  costByTeam: [
    { team: "Research-A", cost: 8.35 },
    { team: "Research-B", cost: 8.35 },
    { team: "Research-C", cost: 8.35 },
  ],
  costByEnvironment: [
    { environment: "Production", cost: 8.35 },
    { environment: "Development", cost: 8.35 },
    { environment: "Test", cost: 8.35 },
  ],
  costByRegion: [{ region: "us-east-1", cost: 25.05 }],
  unattributedCost: 0,
  costTrend: [
    { date: "2024-01-01", cost: 0 },
    { date: "2024-01-15", cost: 25.05 },
    { date: "2024-01-20", cost: 25.05 },
    { date: "2024-01-25", cost: 25.05 },
  ],
  anomalies: [{ date: "2024-01-18", expectedCost: 25.05, actualCost: 32.8 }],
};

// Helper function to calculate efficiency score
export function calculateEfficiencyScore(
  cpuUtilization: number,
  memoryUtilization: number,
  costPerHour: number,
): number {
  // Simple algorithm: average utilization weighted by cost efficiency
  const avgUtilization = (cpuUtilization + memoryUtilization) / 2;

  // Efficiency is high when utilization is 60-90% (sweet spot)
  if (avgUtilization >= 60 && avgUtilization <= 90) {
    return Math.min(100, avgUtilization + 10);
  } else if (avgUtilization < 60) {
    // Penalize low utilization heavily
    return Math.max(0, avgUtilization * 0.8);
  } else {
    // Penalize high utilization moderately (might need bigger instance)
    return Math.max(60, 100 - (avgUtilization - 90) * 2);
  }
}

// Helper function to determine waste level
export function determineWasteLevel(
  efficiencyScore: number,
): "low" | "medium" | "high" {
  if (efficiencyScore >= 70) return "low";
  if (efficiencyScore >= 40) return "medium";
  return "high";
}
