# EC2 Observability Dashboard

A production-ready **AWS EC2 cost optimization dashboard** built with Next.js 15 and React 19. Designed specifically for technical teams to quickly identify cloud waste and optimize infrastructure costs through intelligent utilization analysis.

![Dashboard Preview](https://img.shields.io/badge/Status-Production_Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![AWS](https://img.shields.io/badge/AWS-SDK_v3-orange)

## ✨ Key Features

### 🎯 **Smart Waste Detection**
- **Traffic Light System**: Instant visual identification of inefficient instances (🔴🟡🟢)
- **Efficiency Scoring**: 0-100 algorithm combining CPU, memory, and cost metrics
- **Waste Level Classification**: Automated categorization of high/medium/low waste instances

### 📊 **Interactive Data Table**
- **Real-time Sorting**: Sort by efficiency, cost, utilization, or waste level
- **Comprehensive Metrics**: CPU, memory, cost per hour, monthly projections
- **Instance State Tracking**: Live status monitoring with visual indicators
- **Responsive Design**: Optimized for desktop and mobile workflows

### 🔗 **Smart AWS Integration**
- **Environment-Aware**: Automatically uses mock data in development, AWS in production
- **Graceful Fallbacks**: Never breaks - falls back to mock data if AWS is unavailable
- **Health Check API**: Built-in endpoint to verify data source status
- **Minimal Permissions**: Uses least-privilege IAM policy for security

### 🎨 **Professional UI/UX**
- **Dark Theme**: Tracer-branded professional interface
- **Technical Aesthetics**: Grid patterns and visual dividers for observability focus
- **Performance Optimized**: System-UI fonts and efficient rendering
- **Accessibility**: Proper contrast ratios and semantic HTML

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- (Optional) AWS credentials for live data

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tracer-ec2-observability

# Install dependencies
npm install

# Start development server (uses mock data)
npm run dev
```

Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see the dashboard.

### Using Real AWS Data

1. **Set up AWS credentials** (optional - works with mock data by default):
   ```bash
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"  
   export AWS_REGION="us-east-1"
   ```

2. **Create IAM user** with required permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["ec2:DescribeInstances"],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "ce:GetCostAndUsage",
           "ce:GetDimensionValues",
           "ce:GetUsageReport"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Test connections**:
   ```bash
   # Test EC2 integration
   curl -X POST http://localhost:3000/api/instances
   
   # Test Cost Explorer integration  
   curl -X POST http://localhost:3000/api/costs
   
   # Both should return: {"source": "aws", "status": "connected"}
   ```

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── instances/          # EC2 integration API
│   │   │   └── costs/              # Cost Explorer integration API
│   │   ├── dashboard/              # Main dashboard page  
│   │   └── layout.tsx              # Root layout with Tracer branding
│   ├── components/
│   │   ├── EC2Table.tsx           # EC2 instance table with waste detection
│   │   └── CostOverview.tsx       # Cost analytics dashboard
│   └── lib/
│       ├── mock-data.ts           # Realistic sample data
│       └── colors.ts              # Tracer design system
├── public/
│   ├── tracer-logo-only-white.svg # Official Tracer logo
│   └── tracer-favicon.ico         # Tracer favicon
└── docs/                          # Implementation documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start with hot reload (mock data)
npm run build        # Production build
npm run start        # Start production server

# Code Quality  
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
```

## 🛠 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AWS Integration**: AWS SDK v3 (EC2 + Cost Explorer)
- **Build Tool**: Turbopack (Next.js native)
- **Code Quality**: Biome (linting + formatting)
- **Design System**: Semantic color tokens with dark theme
- **Performance**: System-UI fonts, optimized images, efficient re-renders

## 🎨 Design Philosophy

### Built for Technical Teams
- **Information Density**: Maximum insight per screen space
- **Quick Decision Making**: Traffic light colors for instant waste identification
- **Technical Aesthetics**: Grid patterns and observability-focused design
- **Professional Branding**: Tracer's dark theme with official assets

### Smart Development Approach  
- **Mock-First Development**: Build and iterate quickly without AWS complexity
- **Environment-Aware**: Seamless switching between mock and live data
- **Graceful Degradation**: Never breaks user experience due to AWS issues
- **Performance Optimization**: Built for fast loading and smooth interactions

## 🔍 API Endpoints

### GET `/api/instances`
Returns EC2 instance data with utilization metrics.

**Response:**
```json
{
  "instances": [
    {
      "instanceId": "i-1234567890abcdef0",
      "name": "web-server-prod",
      "instanceType": "t3.medium", 
      "state": "running",
      "cpuUtilization": 85.2,
      "memoryUtilization": 78.5,
      "costPerHour": 0.0416,
      "monthlyCost": 30.00,
      "efficiencyScore": 88,
      "wasteLevel": "low",
      "region": "us-east-1"
    }
  ],
  "source": "mock|aws|mock-fallback",
  "timestamp": "2024-08-25T10:30:00Z"
}
```

### POST `/api/instances` 
Health check endpoint - returns data source status.

## 🚦 Environment Configuration

The application automatically adapts based on your environment:

| Environment | Data Source | Use Case |
|------------|-------------|----------|
| **Development** | Mock data | Fast iteration, no AWS required |
| **Production + AWS credentials** | Live AWS data | Real monitoring |  
| **Production + No credentials** | Mock data fallback | Demo/testing |

## 🎯 Key Metrics & Algorithms

### Efficiency Score Calculation
```typescript
function calculateEfficiencyScore(cpu: number, memory: number, cost: number): number {
  const utilizationScore = (cpu + memory) / 2;
  const costWeight = Math.min(cost * 10, 50); // Cap cost impact
  return Math.round(Math.max(0, utilizationScore - costWeight));
}
```

### Waste Level Classification
- **Low Waste** (🟢): Efficiency score > 70
- **Medium Waste** (🟡): Efficiency score 40-70  
- **High Waste** (🔴): Efficiency score < 40

## 🔒 Security & Best Practices

- **Minimal IAM Permissions**: Only `ec2:DescribeInstances` required
- **No Credential Storage**: Uses environment variables only
- **Error Handling**: Graceful degradation prevents data exposure
- **TypeScript**: Full type safety for reliable AWS integration
- **Linting**: Biome ensures consistent, secure code patterns

## 🤝 Development

### Adding New Features
1. **Start with mock data** - Update `src/lib/mock-data.ts`
2. **Build component** - Use TypeScript interfaces
3. **Test with mock data** - Iterate quickly  
4. **Add AWS integration** - Extend API when ready
5. **Run linting** - `npm run lint` before committing

### Extending AWS Integration
To add CloudWatch metrics or Cost Explorer data:
```bash
npm install @aws-sdk/client-cloudwatch
npm install @aws-sdk/client-cost-explorer
```

## 📈 Production Deployment

The application is optimized for deployment on:
- **Vercel** (recommended - zero configuration)
- **AWS Amplify** 
- **Docker** containers
- **Traditional hosting** with Node.js support

Simply set your AWS environment variables in your hosting platform's dashboard.

## 🎨 Branding

This dashboard implements Tracer's complete brand guidelines:
- **Dark theme** optimized for technical workflows
- **Official logo** and favicon integration  
- **Semantic color system** for maintainable theming
- **Professional typography** with system fonts

## 📄 License

Built as a recruitment assessment for Tracer. Contains official Tracer branding assets.

---

**Ready to optimize your AWS costs?** Start with `npm run dev` and explore your EC2 efficiency in seconds! 🚀