// Mock data that matches AWS EC2 API structure for development

export interface EC2Instance {
  instanceId: string;
  name: string;
  instanceType: string;
  state: string;
  launchTime: string;
  region: string;
  // Filter properties for the filter system
  team?: string;
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
    team: "Chen Lab",
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
      Team: "Chen Lab",
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
    team: "Rodriguez Lab",
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
      Team: "Rodriguez Lab",
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
    region: "us-west-2",
    team: "Watson Lab",
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
      Team: "Watson Lab",
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
    team: "Bioinformatics Core",
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
      Team: "Bioinformatics Core",
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
  _costPerHour: number,
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

// Cost Attribution Data Types
export interface AttributionBreakdown {
  category: string;
  cost: number;
  percentage: number;
  instanceCount: number;
}

// Enhanced Attribution with Grant and PI Information
export interface GrantBreakdown {
  grantId: string; // "NIH R01-2024-001"
  grantName: string; // "Genomics Research Initiative"
  piName: string; // "Dr. Sarah Chen"
  allocatedCost: number;
  percentage: number;
}

export interface TeamBreakdown {
  teamName: string; // "Chen Lab (Genomics)"
  piName: string;
  totalCost: number;
  instanceCount: number;
  efficiency: "high" | "medium" | "low";
}

export interface ResearchAttribution {
  totalCost: number;
  attributedCost: number;
  unaccountedCost: number;
  attributionRate: number;
  grantBreakdown: GrantBreakdown[];
  teamBreakdown: TeamBreakdown[];
}

export interface AttributionData {
  totalCost: number;
  attributedCost: number;
  unaccountedCost: number;
  attributionRate: number; // Percentage of costs that are attributed
  breakdowns: {
    byTeam: AttributionBreakdown[];
    byProject: AttributionBreakdown[];
    byEnvironment: AttributionBreakdown[];
    byInstanceType: AttributionBreakdown[];
    byRegion: AttributionBreakdown[];
  };
  timeRange: {
    start: string;
    end: string;
  };
  lastUpdated: string;
}

// Mock Enhanced Research Attribution Data
export const mockResearchAttribution: ResearchAttribution = {
  totalCost: 2847.23,
  attributedCost: 2564.12,
  unaccountedCost: 283.11,
  attributionRate: 90.1,
  grantBreakdown: [
    {
      grantId: "PROJ-001",
      grantName: "Advanced Data Pipeline Development",
      piName: "Sarah Chen",
      allocatedCost: 1245.67,
      percentage: 48.5,
    },
    {
      grantId: "PROJ-002",
      grantName: "Analytics Framework Project",
      piName: "Maria Rodriguez",
      allocatedCost: 892.34,
      percentage: 34.8,
    },
    {
      grantId: "PROJ-003",
      grantName: "Computing Infrastructure Initiative",
      piName: "David Watson",
      allocatedCost: 426.11,
      percentage: 16.6,
    },
  ],
  teamBreakdown: [
    {
      teamName: "Chen Team",
      piName: "Sarah Chen",
      totalCost: 1245.67,
      instanceCount: 12,
      efficiency: "high",
    },
    {
      teamName: "Rodriguez Team",
      piName: "Maria Rodriguez",
      totalCost: 892.34,
      instanceCount: 8,
      efficiency: "medium",
    },
    {
      teamName: "Watson Team",
      piName: "David Watson",
      totalCost: 426.11,
      instanceCount: 6,
      efficiency: "high",
    },
  ],
};

// Mock Cost Attribution Data (Research Team Focused)
export const mockAttributionData: AttributionData = {
  totalCost: 2847.23,
  attributedCost: 2564.12,
  unaccountedCost: 283.11,
  attributionRate: 90.1,
  breakdowns: {
    byTeam: [
      {
        category: "Chen Lab",
        cost: 1245.67,
        percentage: 48.5,
        instanceCount: 12,
      },
      {
        category: "Rodriguez Lab",
        cost: 892.34,
        percentage: 34.8,
        instanceCount: 8,
      },
      {
        category: "Bioinformatics Core",
        cost: 426.11,
        percentage: 16.6,
        instanceCount: 6,
      },
    ],
    byProject: [
      {
        category: "Drug Discovery Pipeline",
        cost: 1456.78,
        percentage: 56.8,
        instanceCount: 15,
      },
      {
        category: "Cancer Genomics Study",
        cost: 687.45,
        percentage: 26.8,
        instanceCount: 7,
      },
      {
        category: "Protein Folding Analysis",
        cost: 419.89,
        percentage: 16.4,
        instanceCount: 4,
      },
    ],
    byEnvironment: [
      {
        category: "Production",
        cost: 1538.47,
        percentage: 60.0,
        instanceCount: 14,
      },
      {
        category: "Development",
        cost: 641.23,
        percentage: 25.0,
        instanceCount: 8,
      },
      { category: "Testing", cost: 384.42, percentage: 15.0, instanceCount: 4 },
    ],
    byInstanceType: [
      {
        category: "c5.4xlarge",
        cost: 1025.66,
        percentage: 40.0,
        instanceCount: 10,
      },
      {
        category: "m5.2xlarge",
        cost: 641.03,
        percentage: 25.0,
        instanceCount: 8,
      },
      {
        category: "r5.xlarge",
        cost: 512.82,
        percentage: 20.0,
        instanceCount: 6,
      },
      {
        category: "t3.medium",
        cost: 384.61,
        percentage: 15.0,
        instanceCount: 2,
      },
    ],
    byRegion: [
      {
        category: "us-east-1",
        cost: 1795.13,
        percentage: 70.0,
        instanceCount: 18,
      },
      {
        category: "us-west-2",
        cost: 512.82,
        percentage: 20.0,
        instanceCount: 6,
      },
      {
        category: "eu-west-1",
        cost: 256.17,
        percentage: 10.0,
        instanceCount: 2,
      },
    ],
  },
  timeRange: {
    start: "2024-08-01",
    end: "2024-08-25",
  },
  lastUpdated: new Date().toISOString(),
};
