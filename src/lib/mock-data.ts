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
  jobId?: string; // Scientific job identifier for bioinformatics workflows
  // Metrics (will be real CloudWatch data later)
  cpuUtilization: number;
  memoryUtilization: number;
  gpuUtilization: number; // GPU usage percentage (0 if no GPU)
  networkIn: number;
  networkOut: number;
  uptimeHours: number; // Hours since launch
  // Cost data
  costPerHour: number;
  monthlyCost: number;
  // Tags for cost attribution
  tags: { [key: string]: string };
  // Calculated fields
  efficiencyScore: number;
  wasteLevel: "low" | "medium" | "high";
}

// Generate simplified mock data for clean testing
const generateLargeDataset = () => {
  const instanceTypes = [
    { type: "t2.micro", cost: 0.0116 },
    { type: "t3.small", cost: 0.0208 },
    { type: "t3.medium", cost: 0.0416 },
    { type: "m5.large", cost: 0.096 },
    { type: "m5.xlarge", cost: 0.192 },
    { type: "c5.large", cost: 0.085 },
    { type: "c5.xlarge", cost: 0.17 },
    { type: "r5.large", cost: 0.126 },
    { type: "g4dn.xlarge", cost: 0.526 },
    { type: "p3.2xlarge", cost: 3.06 },
  ];

  const regions = ["us-east-1", "us-west-2", "eu-west-1"];

  const teams = [
    "Chen Genomics Laboratory",
    "Rodriguez Bioinformatics Core",
    "Johnson Molecular Dynamics Lab",
    "Williams Data Science Institute",
    "Davis Structural Biology Unit",
  ];

  const environments = ["Production", "Development", "Test"];
  const serverPurposes = [
    "GPU Cluster Node",
    "Database Server",
    "Compute Analysis",
    "Data Pipeline",
    "ML Training",
    "Sequence Alignment",
    "Statistical Analysis",
    "Web Server",
    "File Storage",
    "Development Env",
  ];

  const instances: EC2Instance[] = [];

  // Generate 50 instances for clean testing with guaranteed variations
  for (let i = 1; i <= 50; i++) {
    const instanceType =
      instanceTypes[Math.floor(Math.random() * instanceTypes.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    // Leave some instances without team assignment (10-15% unattributed)
    const team =
      Math.random() < 0.85
        ? teams[Math.floor(Math.random() * teams.length)]
        : undefined;
    const environment =
      environments[Math.floor(Math.random() * environments.length)];
    const purpose =
      serverPurposes[Math.floor(Math.random() * serverPurposes.length)];

    // Ensure we have all status variations by distributing them across instances
    let state: string;
    if (i <= 35) {
      state = "running"; // Most instances running
    } else if (i <= 40) {
      state = "stopped";
    } else if (i <= 45) {
      state = "pending";
    } else if (i <= 48) {
      state = "stopping";
    } else {
      state = "terminated";
    }

    let cpuUtil = 0,
      memUtil = 0,
      gpuUtil = 0,
      networkIn = 0,
      networkOut = 0;
    let efficiencyScore = 0;
    let wasteLevel: "low" | "medium" | "high" = "low";
    let costPerHour = 0,
      monthlyCost = 0;

    // Calculate uptime from launch time
    const launchDate = new Date(
      2024,
      0,
      Math.floor(Math.random() * 25) + 1,
      Math.floor(Math.random() * 24),
    );
    const uptimeHours = Math.floor(
      (Date.now() - launchDate.getTime()) / (1000 * 60 * 60),
    );

    if (state === "running") {
      // Ensure we have all waste level variations by distributing them
      let utilizationPattern: number;
      if (i <= 12) {
        utilizationPattern = Math.random() * 0.3; // Force high waste for first 12 instances
      } else if (i <= 24) {
        utilizationPattern = 0.3 + Math.random() * 0.3; // Force medium waste for next 12
      } else {
        utilizationPattern = 0.6 + Math.random() * 0.4; // Force efficient for rest
      }

      if (utilizationPattern < 0.3) {
        // High waste scenario
        cpuUtil = Math.random() * 15;
        memUtil = Math.random() * 25;
        efficiencyScore = Math.floor(Math.random() * 30);
        wasteLevel = "high";
      } else if (utilizationPattern < 0.6) {
        // Medium efficiency
        cpuUtil = 25 + Math.random() * 35;
        memUtil = 30 + Math.random() * 40;
        efficiencyScore = 35 + Math.floor(Math.random() * 35);
        wasteLevel = "medium";
      } else {
        // Efficient usage
        cpuUtil = 60 + Math.random() * 30;
        memUtil = 65 + Math.random() * 25;
        efficiencyScore = 70 + Math.floor(Math.random() * 30);
        wasteLevel = "low";
      }

      networkIn = Math.random() * 8;
      networkOut = Math.random() * 6;

      // GPU utilization for GPU instance types only
      if (
        instanceType.type.includes("p3") ||
        instanceType.type.includes("g4") ||
        purpose.includes("GPU") ||
        purpose.includes("ML")
      ) {
        gpuUtil =
          utilizationPattern < 0.3
            ? Math.random() * 20
            : utilizationPattern < 0.6
              ? 35 + Math.random() * 40
              : 70 + Math.random() * 25;
      }

      costPerHour = instanceType.cost;
      monthlyCost = costPerHour * 24 * 30;
    }

    const serverName = `Tracer-${purpose.replace(/\s+/g, "").substring(0, 12)}-${String(i).padStart(2, "0")}`;

    // Assign realistic bioinformatics job IDs based on purpose and team
    const availableJobIds = [
      "genome-assembly-2024-03",
      "rnaseq-pipeline-march",
      "variant-calling-cohort-a",
      "ml-training-drug-discovery",
      "protein-folding-sim-v2",
      "dna-sequencing-batch-001",
      "transcriptome-analysis-liver",
      "covid-variant-analysis",
      "cancer-biomarker-study",
      "metabolomics-pathway-map",
      "structural-biology-crystal",
      "pharmacokinetics-model",
      "single-cell-rna-seq",
      "chip-seq-histone-marks",
      "gwas-diabetes-cohort",
      "proteome-mass-spec",
    ];
    const jobId =
      availableJobIds[Math.floor(Math.random() * availableJobIds.length)];

    instances.push({
      instanceId: `i-${Math.random().toString(36).substring(2, 15)}`,
      name: serverName,
      instanceType: instanceType.type,
      state,
      launchTime: launchDate.toISOString(),
      region,
      team,
      jobId,
      cpuUtilization: Number(cpuUtil.toFixed(1)),
      memoryUtilization: Number(memUtil.toFixed(1)),
      gpuUtilization: Number(gpuUtil.toFixed(1)),
      networkIn: Number(networkIn.toFixed(2)),
      networkOut: Number(networkOut.toFixed(2)),
      uptimeHours: Math.max(0, uptimeHours),
      costPerHour: Number(costPerHour.toFixed(4)),
      monthlyCost: Number(monthlyCost.toFixed(2)),
      tags: {
        Name: serverName,
        Purpose: purpose,
        Owner: "Research",
        Environment: environment,
        ...(team && { Team: team }),
      },
      efficiencyScore,
      wasteLevel,
    });
  }

  return instances;
};

export const mockEC2Instances: EC2Instance[] = generateLargeDataset();

// Cost data for cost attribution and overview components
// Enhanced cost trend for research workflow pattern recognition
export interface CostTrendPoint {
  date: string;
  actualCost: number;
  baselineCost: number; // Expected research pattern cost
  pattern: "efficient" | "research_activity" | "wasteful" | "idle";
  annotation?: string; // Explanation of the pattern
  efficiencyScore: number; // 0-100
}

export interface CostData {
  totalMonthlyCost: number;
  totalMonthlyCostPreviousPeriod: number; // Previous month for comparison
  dailyBurnRate: number;
  dailyBurnRatePreviousPeriod: number; // Previous week for comparison
  projectedMonthlyCost: number;
  wasteScore: number; // 0-100 waste score
  wasteScorePreviousPeriod: number; // Previous period waste score for comparison
  wasteAmount: number; // Dollar amount of waste detected
  costByTeam: { team: string; cost: number }[];
  costByEnvironment: { environment: string; cost: number }[];
  costByRegion: { region: string; cost: number }[];
  unattributedCost: number;
  costTrend: CostTrendPoint[]; // Enhanced with research pattern intelligence
  anomalies: { date: string; expectedCost: number; actualCost: number }[];
  weeklyEfficiencyScore: number; // Overall weekly efficiency A-F equivalent
}

// Generate 7-day research workflow pattern with intelligence
const generateResearchWorkflowPattern = (
  dailyBaseline: number,
): CostTrendPoint[] => {
  const today = new Date();
  const trendData: CostTrendPoint[] = [];

  // Research workflow patterns (based on academic computing usage)
  const dayPatterns = {
    monday: { baseMultiplier: 0.9, typical: "High research activity start" },
    tuesday: { baseMultiplier: 1.1, typical: "Peak computational workloads" },
    wednesday: { baseMultiplier: 1.2, typical: "Mid-week research peak" },
    thursday: { baseMultiplier: 1.0, typical: "Steady research activity" },
    friday: { baseMultiplier: 0.8, typical: "Research wind-down" },
    saturday: { baseMultiplier: 0.3, typical: "Weekend minimal activity" },
    sunday: { baseMultiplier: 0.2, typical: "Weekend idle resources" },
  };

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = dayNames[date.getDay()] as keyof typeof dayPatterns;
    const dayPattern = dayPatterns[dayName];

    // Calculate baseline expected cost
    const baselineCost = dailyBaseline * dayPattern.baseMultiplier;

    // Add some realistic variance to actual costs
    const variance = 0.15 + Math.random() * 0.3; // 15-45% variance
    const actualCost = baselineCost * (0.7 + variance);

    // Determine pattern based on actual vs baseline efficiency
    const efficiency = (baselineCost / actualCost) * 100;
    let patternType: CostTrendPoint["pattern"];
    let annotation: string;

    if (efficiency > 90) {
      patternType = "efficient";
      annotation = `Optimal usage - ${dayPattern.typical.toLowerCase()}`;
    } else if (efficiency > 70) {
      patternType = "research_activity";
      annotation = dayPattern.typical;
    } else if (efficiency > 40) {
      patternType = "wasteful";
      annotation = `Inefficient resources - ${Math.round((1 - efficiency / 100) * 100)}% waste detected`;
    } else {
      patternType = "idle";
      annotation = "Idle resources detected - consider shutdown";
    }

    // Weekend special cases
    if (dayName === "saturday" || dayName === "sunday") {
      if (actualCost > baselineCost * 1.5) {
        patternType = "wasteful";
        annotation = "Unexpected weekend activity - check for runaway jobs";
      } else if (actualCost < baselineCost * 1.2) {
        patternType = "efficient";
        annotation = "Good weekend resource management";
      }
    }

    trendData.push({
      date: date.toISOString().split("T")[0],
      actualCost: Math.round(actualCost * 100) / 100,
      baselineCost: Math.round(baselineCost * 100) / 100,
      pattern: patternType,
      annotation,
      efficiencyScore: Math.round(Math.min(efficiency, 100)),
    });
  }

  return trendData;
};

// Generate cost data based on the simplified dataset
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

  // Calculate previous period comparisons with realistic variance
  const totalMonthlyCostPreviousPeriod =
    totalMonthlyCost * (0.88 + Math.random() * 0.24); // ±12% variance from current
  const dailyBurnRatePreviousPeriod =
    dailyBurnRate * (0.92 + Math.random() * 0.16); // ±8% variance from current

  // Calculate waste metrics based on instance efficiency
  const avgEfficiencyScore =
    runningInstances.reduce(
      (sum, instance) => sum + instance.efficiencyScore,
      0,
    ) / runningInstances.length;
  const wasteScore = Math.round(100 - avgEfficiencyScore); // Higher score = more waste
  const wasteScorePreviousPeriod = Math.round(
    wasteScore * (0.85 + Math.random() * 0.3),
  ); // ±15% variance from current
  const wasteAmount = totalMonthlyCost * (wasteScore / 100) * 0.4; // Realistic waste calculation

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
    totalMonthlyCostPreviousPeriod:
      Math.round(totalMonthlyCostPreviousPeriod * 100) / 100,
    dailyBurnRate: Math.round(dailyBurnRate * 100) / 100,
    dailyBurnRatePreviousPeriod:
      Math.round(dailyBurnRatePreviousPeriod * 100) / 100,
    projectedMonthlyCost: Math.round(projectedMonthlyCost * 100) / 100,
    wasteScore: Math.round(wasteScore),
    wasteScorePreviousPeriod: Math.round(wasteScorePreviousPeriod),
    wasteAmount: Math.round(wasteAmount * 100) / 100,
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
    costTrend: generateResearchWorkflowPattern(dailyBurnRate),
    anomalies: [
      // Critical severity spike - GPU cluster runaway job (yesterday)
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expectedCost: Math.round(dailyBurnRate * 0.92 * 100) / 100,
        actualCost: Math.round(dailyBurnRate * 2.1 * 100) / 100, // 128% spike
      },
      // High severity spike - Large-scale genomics run (2 days ago)
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expectedCost: Math.round(dailyBurnRate * 0.85 * 100) / 100,
        actualCost: Math.round(dailyBurnRate * 1.45 * 100) / 100, // 70% spike
      },
      // Medium severity spike - Failed auto-shutdown (5 days ago)
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expectedCost: Math.round(dailyBurnRate * 0.9 * 100) / 100,
        actualCost: Math.round(dailyBurnRate * 1.22 * 100) / 100, // 36% spike
      },
      // Low severity drop - Weekend efficiency (8 days ago)
      {
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expectedCost: Math.round(dailyBurnRate * 1.0 * 100) / 100,
        actualCost: Math.round(dailyBurnRate * 0.88 * 100) / 100, // 12% drop
      },
      // High severity spike - Runaway compute job (12 days ago)
      {
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expectedCost: Math.round(dailyBurnRate * 0.95 * 100) / 100,
        actualCost: Math.round(dailyBurnRate * 1.38 * 100) / 100, // 45% spike
      },
      // Medium severity spike - Team onboarding (15 days ago)
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expectedCost: Math.round(dailyBurnRate * 0.92 * 100) / 100,
        actualCost: Math.round(dailyBurnRate * 1.16 * 100) / 100, // 26% spike
      },
    ],
    weeklyEfficiencyScore: calculateWeeklyEfficiency(
      generateResearchWorkflowPattern(dailyBurnRate),
    ),
  };
};

// Calculate overall weekly efficiency score from trend data
const calculateWeeklyEfficiency = (trendData: CostTrendPoint[]): number => {
  const averageEfficiency =
    trendData.reduce((sum, point) => sum + point.efficiencyScore, 0) /
    trendData.length;
  return Math.round(averageEfficiency);
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

// Attribution Health Alert Types
export interface AttributionAlert {
  type: "untagged" | "budget_overrun" | "coverage_drop" | "quick_win";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  count?: number;
  amount?: number;
  actionable: boolean;
}

export interface AttributionData {
  totalCost: number;
  attributedCost: number;
  unaccountedCost: number;
  attributionRate: number; // Percentage of costs that are attributed
  attributionRatePreviousPeriod: number; // Previous period for comparison
  untaggedInstanceCount: number; // Instances without proper team/project tags
  alerts: AttributionAlert[]; // Health alerts and quick wins
  breakdowns: {
    byTeam: AttributionBreakdown[];
    byProject: AttributionBreakdown[];
    byEnvironment: AttributionBreakdown[];
    byInstanceType: AttributionBreakdown[];
    byRegion: AttributionBreakdown[];
    byJob: AttributionBreakdown[];
  };
  timeRange: {
    start: string;
    end: string;
  };
  lastUpdated: string;
}

// Generate simplified attribution data
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
      piName: `${teamName.split(" ")[0]} ${teamName.split(" ")[1]}`, // Extract PI name from team
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

// Generate simplified attribution breakdowns
const generateAttributionBreakdowns = () => {
  // Use base total cost for simplicity
  const totalCost = 3847.21;

  // Simple static breakdowns for clean, predictable data
  const byTeam = [
    { category: "Chen Lab", cost: 1234.56, percentage: 32.1, instanceCount: 8 },
    {
      category: "Rodriguez Research",
      cost: 987.43,
      percentage: 25.7,
      instanceCount: 6,
    },
    {
      category: "Johnson Group",
      cost: 765.89,
      percentage: 19.9,
      instanceCount: 5,
    },
    { category: "Smith Lab", cost: 543.21, percentage: 14.1, instanceCount: 4 },
    {
      category: "Wilson Team",
      cost: 316.12,
      percentage: 8.2,
      instanceCount: 2,
    },
  ];

  const byProject = [
    {
      category: "Genomic Sequencing",
      cost: 1456.78,
      percentage: 37.9,
      instanceCount: 12,
    },
    {
      category: "Drug Discovery",
      cost: 1123.45,
      percentage: 29.2,
      instanceCount: 8,
    },
    {
      category: "Protein Analysis",
      cost: 789.32,
      percentage: 20.5,
      instanceCount: 6,
    },
    {
      category: "Cancer Research",
      cost: 477.66,
      percentage: 12.4,
      instanceCount: 4,
    },
  ];

  const byEnvironment = [
    {
      category: "Production",
      cost: 2308.33,
      percentage: 60.0,
      instanceCount: 18,
    },
    {
      category: "Development",
      cost: 1154.16,
      percentage: 30.0,
      instanceCount: 9,
    },
    { category: "Testing", cost: 384.72, percentage: 10.0, instanceCount: 3 },
  ];

  const byInstanceType = [
    {
      category: "c5.2xlarge",
      cost: 1538.88,
      percentage: 40.0,
      instanceCount: 12,
    },
    {
      category: "m5.xlarge",
      cost: 1154.16,
      percentage: 30.0,
      instanceCount: 15,
    },
    { category: "r5.large", cost: 769.44, percentage: 20.0, instanceCount: 8 },
    {
      category: "t3.medium",
      cost: 384.73,
      percentage: 10.0,
      instanceCount: 10,
    },
  ];

  const byRegion = [
    {
      category: "us-east-1",
      cost: 2308.33,
      percentage: 60.0,
      instanceCount: 20,
    },
    {
      category: "us-west-2",
      cost: 1154.16,
      percentage: 30.0,
      instanceCount: 8,
    },
    { category: "eu-west-1", cost: 384.72, percentage: 10.0, instanceCount: 2 },
  ];

  const byJob = [
    {
      category: "genome-assembly-2024-03",
      cost: 892.45,
      percentage: 23.2,
      instanceCount: 6,
    },
    {
      category: "rnaseq-pipeline-march",
      cost: 731.23,
      percentage: 19.0,
      instanceCount: 4,
    },
    {
      category: "variant-calling-cohort-a",
      cost: 654.87,
      percentage: 17.0,
      instanceCount: 5,
    },
    {
      category: "ml-training-drug-discovery",
      cost: 576.44,
      percentage: 15.0,
      instanceCount: 3,
    },
    {
      category: "protein-folding-sim-v2",
      cost: 423.16,
      percentage: 11.0,
      instanceCount: 4,
    },
    {
      category: "dna-sequencing-batch-001",
      cost: 346.53,
      percentage: 9.0,
      instanceCount: 3,
    },
    {
      category: "transcriptome-analysis-liver",
      cost: 222.53,
      percentage: 5.8,
      instanceCount: 2,
    },
  ];

  // Simplified attribution metrics
  const attributedCost = 3385.08; // 88% of total
  const unaccountedCost = 462.13; // 12% unaccounted
  const attributionRate = 88.0;
  const attributionRatePreviousPeriod = 83.2; // Shows improvement
  const untaggedInstanceCount = 7;

  // Simple, focused alerts
  const alerts: AttributionAlert[] = [
    {
      type: "untagged",
      severity: "medium",
      title: "7 instances need team tags",
      description: "Improve attribution coverage by adding team/project tags",
      count: 7,
      actionable: true,
    },
    {
      type: "budget_overrun",
      severity: "medium",
      title: "Chen Lab: 115% of grant allocation used",
      description: "Team spending exceeds planned budget allocation",
      actionable: true,
    },
    {
      type: "quick_win",
      severity: "low",
      title: "Tag 3 largest instances to reach 92% coverage",
      description: "Focus on c5.2xlarge instances first for maximum impact",
      count: 3,
      actionable: true,
    },
  ];

  return {
    totalCost,
    attributedCost,
    unaccountedCost,
    attributionRate,
    attributionRatePreviousPeriod,
    untaggedInstanceCount,
    alerts,
    breakdowns: {
      byTeam,
      byProject,
      byEnvironment,
      byInstanceType,
      byRegion,
      byJob,
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
