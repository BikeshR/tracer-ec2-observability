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

// Generate large-scale mock data for stress testing
const generateLargeDataset = () => {
  const instanceTypes = [
    { type: "t2.micro", cost: 0.0116 },
    { type: "t3.small", cost: 0.0208 },
    { type: "t3.medium", cost: 0.0416 },
    { type: "t3.large", cost: 0.0832 },
    { type: "t3.xlarge", cost: 0.1664 },
    { type: "m5.large", cost: 0.096 },
    { type: "m5.xlarge", cost: 0.192 },
    { type: "m5.2xlarge", cost: 0.384 },
    { type: "m5.4xlarge", cost: 0.768 },
    { type: "c5.large", cost: 0.085 },
    { type: "c5.xlarge", cost: 0.17 },
    { type: "c5.2xlarge", cost: 0.34 },
    { type: "c5.4xlarge", cost: 0.68 },
    { type: "r5.large", cost: 0.126 },
    { type: "r5.xlarge", cost: 0.252 },
    { type: "r5.2xlarge", cost: 0.504 },
    { type: "r5.4xlarge", cost: 1.008 },
    { type: "g4dn.xlarge", cost: 0.526 },
    { type: "g4dn.2xlarge", cost: 0.752 },
    { type: "p3.2xlarge", cost: 3.06 },
  ];

  const regions = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "eu-central-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
    "ap-south-1",
  ];

  const teams = [
    "Chen Genomics Laboratory",
    "Rodriguez Bioinformatics Core",
    "Watson Computational Biology Unit",
    "Anderson Proteomics Research Center",
    "Johnson Molecular Dynamics Lab",
    "Williams Data Science Institute",
    "Brown Systems Biology Laboratory",
    "Davis Structural Biology Unit",
    "Miller Evolutionary Biology Lab",
    "Wilson Cancer Research Institute",
    "Moore Neuroscience Computing Center",
    "Taylor Drug Discovery Platform",
    "Jackson High Performance Computing Lab",
    "White Machine Learning Research Group",
    "Harris Biostatistics Department",
    "Martin Synthetic Biology Laboratory",
    "Thompson Precision Medicine Unit",
    "Garcia Population Genetics Lab",
    "Martinez Comparative Genomics Center",
    "Robinson Immunology Informatics Lab",
    "Clark Metabolomics Research Unit",
    "Lewis Epigenetics Laboratory",
    "Lee Systems Pharmacology Center",
    "Walker Microbiome Analysis Lab",
    "Hall Cryo-EM Computing Facility",
    "Allen Single Cell Analysis Lab",
    "Young Proteome Informatics Unit",
    "King Structural Genomics Laboratory",
    "Wright Computational Neuroscience Lab",
    "Lopez Network Biology Center",
  ];

  const states = ["running", "stopped", "stopping", "pending", "terminated"];
  const environments = ["Production", "Development", "Test", "Staging"];
  const serverPurposes = [
    "GPU Cluster Node",
    "High Memory Database Server",
    "Compute Intensive Analysis",
    "Data Processing Pipeline",
    "Machine Learning Training",
    "Sequence Alignment Server",
    "Protein Structure Modeling",
    "Statistical Analysis Workstation",
    "Web Application Server",
    "File Storage Server",
    "Backup and Archive System",
    "Development Environment",
    "Testing Framework Server",
    "CI/CD Pipeline Runner",
    "Container Orchestration Node",
    "Load Balancer",
    "Monitoring and Logging Server",
    "Security Scanning System",
    "Data Warehouse Server",
    "Real-time Analytics Engine",
  ];

  const instances: EC2Instance[] = [];

  // Generate 150 instances for comprehensive stress testing
  for (let i = 1; i <= 150; i++) {
    const instanceType =
      instanceTypes[Math.floor(Math.random() * instanceTypes.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const environment =
      environments[Math.floor(Math.random() * environments.length)];
    const purpose =
      serverPurposes[Math.floor(Math.random() * serverPurposes.length)];

    let cpuUtil = 0,
      memUtil = 0,
      networkIn = 0,
      networkOut = 0;
    let efficiencyScore = 0;
    let wasteLevel: "low" | "medium" | "high" = "low";
    let costPerHour = 0,
      monthlyCost = 0;

    if (state === "running") {
      const utilizationPattern = Math.random();
      if (utilizationPattern < 0.2) {
        cpuUtil = Math.random() * 10;
        memUtil = Math.random() * 20;
        efficiencyScore = Math.floor(Math.random() * 30);
        wasteLevel = "high";
      } else if (utilizationPattern < 0.5) {
        cpuUtil = 20 + Math.random() * 40;
        memUtil = 25 + Math.random() * 45;
        efficiencyScore = 30 + Math.floor(Math.random() * 40);
        wasteLevel = "medium";
      } else {
        cpuUtil = 50 + Math.random() * 40;
        memUtil = 55 + Math.random() * 35;
        efficiencyScore = 60 + Math.floor(Math.random() * 40);
        wasteLevel = "low";
      }

      networkIn = Math.random() * 10;
      networkOut = Math.random() * 8;
      costPerHour = instanceType.cost;
      monthlyCost = costPerHour * 24 * 30;
    }

    let serverName: string;
    if (i % 15 === 0) {
      serverName = `Tracer-VeryLongServerNameForTextOverflowTesting-${purpose.replace(/\s+/g, "")}-${i}`;
    } else {
      serverName = `Tracer-${purpose.replace(/\s+/g, "").substring(0, 15)}-${String(i).padStart(3, "0")}`;
    }

    instances.push({
      instanceId: `i-${Math.random().toString(36).substring(2, 15)}`,
      name: serverName,
      instanceType: instanceType.type,
      state,
      launchTime: new Date(
        2024,
        0,
        Math.floor(Math.random() * 25) + 1,
        Math.floor(Math.random() * 24),
      ).toISOString(),
      region,
      team,
      cpuUtilization: Number(cpuUtil.toFixed(1)),
      memoryUtilization: Number(memUtil.toFixed(1)),
      networkIn: Number(networkIn.toFixed(2)),
      networkOut: Number(networkOut.toFixed(2)),
      costPerHour: Number(costPerHour.toFixed(4)),
      monthlyCost: Number(monthlyCost.toFixed(2)),
      tags: {
        Name: serverName,
        Purpose: purpose,
        Owner: "Stress-Test",
        Environment: environment,
        Team: team,
      },
      efficiencyScore,
      wasteLevel,
    });
  }

  return instances;
};

export const mockEC2Instances: EC2Instance[] = generateLargeDataset();

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

// Generate cost data based on the large dataset
const generateCostData = (): CostData => {
  const instances = generateLargeDataset();
  const runningInstances = instances.filter((i) => i.state === "running");

  // Calculate total costs from running instances
  const totalMonthlyCost = runningInstances.reduce(
    (sum, instance) => sum + instance.monthlyCost,
    0,
  );
  const dailyBurnRate = totalMonthlyCost / 30;
  const projectedMonthlyCost = totalMonthlyCost * 1.08; // 8% growth projection

  // Group by teams for cost breakdown
  const teamCosts = new Map<string, number>();
  runningInstances.forEach((instance) => {
    const current = teamCosts.get(instance.team || "Unknown") || 0;
    teamCosts.set(instance.team || "Unknown", current + instance.monthlyCost);
  });

  // Group by environments
  const environmentCosts = new Map<string, number>();
  runningInstances.forEach((instance) => {
    const env = instance.tags.Environment || "Unknown";
    const current = environmentCosts.get(env) || 0;
    environmentCosts.set(env, current + instance.monthlyCost);
  });

  // Group by regions
  const regionCosts = new Map<string, number>();
  runningInstances.forEach((instance) => {
    const current = regionCosts.get(instance.region) || 0;
    regionCosts.set(instance.region, current + instance.monthlyCost);
  });

  return {
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
    dailyBurnRate: Math.round(dailyBurnRate * 100) / 100,
    projectedMonthlyCost: Math.round(projectedMonthlyCost * 100) / 100,
    costByTeam: Array.from(teamCosts.entries())
      .map(([team, cost]) => ({ team, cost: Math.round(cost * 100) / 100 }))
      .sort((a, b) => b.cost - a.cost),
    costByEnvironment: Array.from(environmentCosts.entries())
      .map(([environment, cost]) => ({
        environment,
        cost: Math.round(cost * 100) / 100,
      }))
      .sort((a, b) => b.cost - a.cost),
    costByRegion: Array.from(regionCosts.entries())
      .map(([region, cost]) => ({ region, cost: Math.round(cost * 100) / 100 }))
      .sort((a, b) => b.cost - a.cost),
    unattributedCost: Math.round(totalMonthlyCost * 0.12 * 100) / 100, // 12% unattributed
    costTrend: [
      {
        date: "2024-01-01",
        cost: Math.round(totalMonthlyCost * 0.1 * 100) / 100,
      },
      {
        date: "2024-01-15",
        cost: Math.round(totalMonthlyCost * 0.7 * 100) / 100,
      },
      {
        date: "2024-01-20",
        cost: Math.round(totalMonthlyCost * 0.9 * 100) / 100,
      },
      { date: "2024-01-25", cost: Math.round(totalMonthlyCost * 100) / 100 },
    ],
    anomalies: [
      {
        date: "2024-01-18",
        expectedCost: Math.round(totalMonthlyCost * 0.8 * 100) / 100,
        actualCost: Math.round(totalMonthlyCost * 1.3 * 100) / 100,
      },
      {
        date: "2024-01-22",
        expectedCost: Math.round(totalMonthlyCost * 0.95 * 100) / 100,
        actualCost: Math.round(totalMonthlyCost * 1.15 * 100) / 100,
      },
    ],
  };
};

export const mockCostData: CostData = generateCostData();

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

// Generate large-scale attribution data
const generateAttributionData = () => {
  const instances = generateLargeDataset();
  const runningInstances = instances.filter((i) => i.state === "running");
  const totalCost = runningInstances.reduce(
    (sum, instance) => sum + instance.monthlyCost,
    0,
  );

  // Generate team breakdown from actual data
  const teamCosts = new Map<string, { cost: number; instanceCount: number }>();
  runningInstances.forEach((instance) => {
    const team = instance.team || "Unknown";
    const current = teamCosts.get(team) || { cost: 0, instanceCount: 0 };
    teamCosts.set(team, {
      cost: current.cost + instance.monthlyCost,
      instanceCount: current.instanceCount + 1,
    });
  });

  // Convert to team breakdown array
  const teamBreakdownArray = Array.from(teamCosts.entries())
    .map(([teamName, data]) => ({
      teamName,
      piName: teamName.split(" ")[0] + " " + teamName.split(" ")[1], // Extract PI name from team
      totalCost: Math.round(data.cost * 100) / 100,
      instanceCount: data.instanceCount,
      efficiency:
        data.cost > totalCost * 0.1
          ? "high"
          : data.cost > totalCost * 0.05
            ? "medium"
            : ("low" as "high" | "medium" | "low"),
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 15); // Top 15 teams

  // Generate grants based on teams
  const grantBreakdown = teamBreakdownArray.slice(0, 12).map((team, index) => ({
    grantId: `NIH-R01-${String(index + 1).padStart(3, "0")}`,
    grantName: `${team.teamName.split(" ").slice(-2).join(" ")} Research Initiative`,
    piName: team.piName,
    allocatedCost: team.totalCost,
    percentage: Number(((team.totalCost / totalCost) * 100).toFixed(1)),
  }));

  const attributedCost = Math.round(totalCost * 0.88 * 100) / 100; // 88% attributed
  const unaccountedCost = Math.round((totalCost - attributedCost) * 100) / 100;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    attributedCost,
    unaccountedCost,
    attributionRate: Number(((attributedCost / totalCost) * 100).toFixed(1)),
    grantBreakdown,
    teamBreakdown: teamBreakdownArray,
  };
};

export const mockResearchAttribution: ResearchAttribution =
  generateAttributionData();

// Generate comprehensive attribution breakdowns
const generateAttributionBreakdowns = () => {
  const instances = generateLargeDataset();
  const runningInstances = instances.filter((i) => i.state === "running");
  const totalCost = runningInstances.reduce(
    (sum, instance) => sum + instance.monthlyCost,
    0,
  );

  // Generate team breakdown
  const teamCosts = new Map<string, { cost: number; instanceCount: number }>();
  runningInstances.forEach((instance) => {
    const team = instance.team || "Unknown";
    const current = teamCosts.get(team) || { cost: 0, instanceCount: 0 };
    teamCosts.set(team, {
      cost: current.cost + instance.monthlyCost,
      instanceCount: current.instanceCount + 1,
    });
  });

  // Other breakdowns follow similar patterns
  const environmentCosts = new Map<
    string,
    { cost: number; instanceCount: number }
  >();
  const instanceTypeCosts = new Map<
    string,
    { cost: number; instanceCount: number }
  >();
  const regionCosts = new Map<
    string,
    { cost: number; instanceCount: number }
  >();

  runningInstances.forEach((instance) => {
    // Environment breakdown
    const env = instance.tags.Environment || "Unknown";
    const envCurrent = environmentCosts.get(env) || {
      cost: 0,
      instanceCount: 0,
    };
    environmentCosts.set(env, {
      cost: envCurrent.cost + instance.monthlyCost,
      instanceCount: envCurrent.instanceCount + 1,
    });

    // Instance type breakdown
    const typeCurrent = instanceTypeCosts.get(instance.instanceType) || {
      cost: 0,
      instanceCount: 0,
    };
    instanceTypeCosts.set(instance.instanceType, {
      cost: typeCurrent.cost + instance.monthlyCost,
      instanceCount: typeCurrent.instanceCount + 1,
    });

    // Region breakdown
    const regionCurrent = regionCosts.get(instance.region) || {
      cost: 0,
      instanceCount: 0,
    };
    regionCosts.set(instance.region, {
      cost: regionCurrent.cost + instance.monthlyCost,
      instanceCount: regionCurrent.instanceCount + 1,
    });
  });

  // Convert to breakdown arrays
  const byTeam = Array.from(teamCosts.entries())
    .map(([category, data]) => ({
      category,
      cost: Math.round(data.cost * 100) / 100,
      percentage: Number(((data.cost / totalCost) * 100).toFixed(1)),
      instanceCount: data.instanceCount,
    }))
    .sort((a, b) => b.cost - a.cost);

  const byEnvironment = Array.from(environmentCosts.entries())
    .map(([category, data]) => ({
      category,
      cost: Math.round(data.cost * 100) / 100,
      percentage: Number(((data.cost / totalCost) * 100).toFixed(1)),
      instanceCount: data.instanceCount,
    }))
    .sort((a, b) => b.cost - a.cost);

  const byInstanceType = Array.from(instanceTypeCosts.entries())
    .map(([category, data]) => ({
      category,
      cost: Math.round(data.cost * 100) / 100,
      percentage: Number(((data.cost / totalCost) * 100).toFixed(1)),
      instanceCount: data.instanceCount,
    }))
    .sort((a, b) => b.cost - a.cost);

  const byRegion = Array.from(regionCosts.entries())
    .map(([category, data]) => ({
      category,
      cost: Math.round(data.cost * 100) / 100,
      percentage: Number(((data.cost / totalCost) * 100).toFixed(1)),
      instanceCount: data.instanceCount,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Generate project breakdown (synthetic)
  const projects = [
    "High-Throughput Genomic Sequencing",
    "AI-Driven Drug Discovery Platform",
    "Protein Structure Prediction",
    "Cancer Immunotherapy Research",
    "Metabolic Pathway Analysis",
    "Single-Cell RNA Sequencing",
    "Biomarker Discovery Pipeline",
    "Pharmacogenomics Study",
    "Synthetic Biology Platform",
    "Microbiome Analysis Framework",
    "Structural Biology Computation",
    "Epidemiological Modeling",
  ];

  const byProject = projects
    .map((project) => {
      const cost =
        (totalCost / projects.length) * (1 + (Math.random() - 0.5) * 0.8);
      return {
        category: project,
        cost: Math.round(cost * 100) / 100,
        percentage: Number(((cost / totalCost) * 100).toFixed(1)),
        instanceCount:
          Math.floor(runningInstances.length / projects.length) +
          Math.floor(Math.random() * 5),
      };
    })
    .sort((a, b) => b.cost - a.cost);

  const attributedCost = Math.round(totalCost * 0.88 * 100) / 100;
  const unaccountedCost = Math.round((totalCost - attributedCost) * 100) / 100;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    attributedCost,
    unaccountedCost,
    attributionRate: Number(((attributedCost / totalCost) * 100).toFixed(1)),
    breakdowns: {
      byTeam,
      byProject,
      byEnvironment,
      byInstanceType,
      byRegion,
    },
    timeRange: {
      start: "2024-08-01",
      end: "2024-08-25",
    },
    lastUpdated: new Date().toISOString(),
  };
};

export const mockAttributionData: AttributionData =
  generateAttributionBreakdowns();
