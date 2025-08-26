# EC2 Observability Dashboard

A production-ready **AWS EC2 cost optimization dashboard** built with Next.js 15 and React 19. Features intelligent waste detection, actionable optimization recommendations, and modern shadcn/ui design system. Designed specifically for technical teams to quickly identify cloud waste and make smarter infrastructure decisions.

![Dashboard Preview](https://img.shields.io/badge/Status-Enhanced_Production_Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![AWS](https://img.shields.io/badge/AWS-SDK_v3-orange) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-purple)

## ✨ Key Features

### 🧠 **Smart Suggestions System** (NEW!)
- **Actionable Recommendations**: Specific optimization steps with calculated savings potential
- **Stop Underused Instances**: Automated detection of <5% CPU usage patterns
- **Instance Sizing Optimization**: Precise monthly savings calculations ($7.52/month potential)
- **Auto-Shutdown Scheduling**: Non-prod environment automation recommendations
- **Visual Intelligence**: Color-coded priority system for immediate action identification

### 🎯 **Enhanced Waste Detection**
- **Traffic Light System**: Instant visual identification of inefficient instances (🔴🟡🟢)
- **Efficiency Scoring**: Refined 0-100 algorithm combining CPU, memory, and cost metrics
- **Perfect Alignment**: Header and row padding consistency (px-4 throughout)
- **Complete Sorting**: All columns sortable including Memory % and State
- **Semantic Styling**: shadcn/ui Badge components with proper variants

### 📊 **Modern Interactive Table**
- **Comprehensive Sorting**: Instance, CPU, Memory, Cost, State, Efficiency, Waste Alert
- **Clean Boundaries**: Proper Card integration with footer inside component
- **Responsive Design**: Optimized for desktop and mobile workflows with hover effects
- **Loading States**: Professional Skeleton components during data fetch
- **Visual Consistency**: Semantic border styling using CSS custom properties

### 🎨 **Professional Modern UI**
- **shadcn/ui Integration**: Complete component library with Radix UI primitives
- **Tailwind CSS v4**: CSS-first configuration with @theme inline directive
- **Semantic Color System**: OKLCH color format with --success, --warning, --destructive variables
- **Lucide React Icons**: Consistent iconography throughout the application
- **Perfect Accessibility**: Keyboard navigation and screen reader support

### 🔍 **Comprehensive Filter System** (NEW!)
- **Persistent Storage**: User preferences remembered across sessions
- **Custom Views**: Create, edit, and manage personalized filter combinations
- **Real-time Filtering**: Instant updates across all dashboard components
- **Smart Presets**: All Data, My Lab, US East pre-configured views
- **Advanced Management**: Full CRUD interface for filter view management

### 🔗 **Smart AWS Integration**
- **Environment-Aware**: Automatically uses mock data in development, AWS in production
- **Graceful Fallbacks**: Never breaks - falls back to mock data if AWS is unavailable
- **Health Check API**: Built-in endpoint to verify data source status
- **Minimal Permissions**: Uses least-privilege IAM policy for security

### 🏗️ **Modern Architecture**
- **Component Isolation**: shadcn/ui components with proper TypeScript interfaces
- **Balanced Grid Layout**: 4,3,2,1 card distribution for optimal visual hierarchy
- **Context-Based State**: React Context for global filter management
- **Custom Hooks**: useFilteredData for consistent data processing
- **Performance Optimized**: Next.js 15 with Turbopack and modern build tools

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
   
   # All should return: {"source": "aws", "status": "connected"}
   ```

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── instances/          # EC2 integration API
│   │   │   └── costs/              # Cost Explorer integration API
│   │   ├── dashboard/              # Main dashboard page with modern layout
│   │   ├── layout.tsx              # Root layout with theme provider
│   │   └── globals.css             # Tailwind v4 CSS-first configuration
│   ├── components/
│   │   ├── ui/                     # shadcn/ui component library
│   │   │   ├── badge.tsx           # Badge variants for status indicators
│   │   │   ├── button.tsx          # Button with multiple variants
│   │   │   ├── card.tsx            # Card with header/content structure
│   │   │   ├── dialog.tsx          # Modal dialogs with overlay
│   │   │   ├── input.tsx           # Form input components
│   │   │   ├── progress.tsx        # Progress bars for metrics
│   │   │   ├── select.tsx          # Dropdown select components
│   │   │   ├── skeleton.tsx        # Loading state components
│   │   │   ├── table.tsx           # Table with proper semantic HTML
│   │   │   └── ...                 # Additional UI primitives
│   │   ├── filters/                # Complete filter system
│   │   │   ├── FilterContext.tsx   # Global state management
│   │   │   ├── FilterSystem.tsx    # Main filter interface
│   │   │   ├── FilterSelect.tsx    # Custom select with icons
│   │   │   ├── ManageViewsDialog.tsx # CRUD interface for views
│   │   │   └── index.ts            # Barrel exports
│   │   ├── EC2Table.tsx            # Enhanced table with perfect alignment
│   │   ├── CostOverview.tsx        # Cost analytics with Smart Suggestions
│   │   └── CostAttributionPanel.tsx # Team/project attribution
│   ├── hooks/
│   │   ├── useFilteredData.ts      # Consistent data filtering logic
│   │   └── useFilteredInstances.ts # Specialized EC2 filtering
│   ├── lib/
│   │   ├── mock-data.ts            # Comprehensive sample data
│   │   ├── filter-storage.ts       # Persistent storage utilities
│   │   └── utils.ts                # Utility functions (cn, etc.)
│   ├── types/
│   │   └── filters.ts              # TypeScript interfaces
└── public/
    ├── tracer-logo-only-white.svg  # Official Tracer branding
    └── tracer-favicon.ico          # Brand favicon
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start with hot reload (mock data)
npm run build        # Production build with Turbopack
npm run start        # Start production server

# Code Quality  
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
```

## 🛠 Modern Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4 (CSS-first)
- **UI System**: shadcn/ui + Radix UI primitives for accessibility
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context + Custom hooks + localStorage persistence
- **AWS Integration**: AWS SDK v3 (EC2 + CloudWatch + Cost Explorer)
- **Build Tool**: Turbopack (Next.js native) for fast development
- **Code Quality**: Biome (linting + formatting) for consistent codebase
- **Styling**: Semantic CSS custom properties with OKLCH colors

## 🎨 Modern Design Philosophy

### Built for Technical Teams
- **Actionable Intelligence**: Smart Suggestions transform data into specific next steps
- **Information Density**: Maximum insight per screen space with proper hierarchy
- **Quick Decision Making**: Traffic light colors for instant waste identification
- **Professional Aesthetics**: shadcn/ui design system with consistent spacing

### Smart Development Approach  
- **Component-First**: shadcn/ui primitives for maintainable, accessible interfaces
- **CSS-First Configuration**: Tailwind v4 with semantic color system
- **Mock-First Development**: Build and iterate quickly without AWS complexity
- **Environment-Aware**: Seamless switching between mock and live data
- **Filter Persistence**: User preferences remembered across sessions

## 🔍 Enhanced API Endpoints

### GET `/api/instances`
Returns EC2 instance data with utilization metrics and smart recommendations.

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
      "region": "us-east-1",
      "tags": {
        "Team": "DevOps",
        "Environment": "Production"
      }
    }
  ],
  "source": "mock|aws|mock-fallback",
  "timestamp": "2024-08-25T10:30:00Z"
}
```

### POST `/api/instances` 
Health check endpoint - returns data source status and recommendations summary.

## 🔄 Filter System

The comprehensive filter system provides:

| Feature | Description |
|---------|-------------|
| **Persistent Views** | Custom filter combinations saved across sessions |
| **Smart Presets** | All Data, My Lab, US East pre-configured |
| **Real-time Updates** | Instant filtering across all components |
| **Team & Region** | Multi-select filtering with visual indicators |
| **CRUD Management** | Create, edit, delete custom views |

## 🧠 Smart Suggestions Engine

### Recommendation Types
- **Stop Underused Instances**: CPU usage < 5% detection
- **Optimize Instance Sizing**: Right-sizing recommendations with savings
- **Schedule Auto-Shutdown**: Non-production environment automation
- **Cost Anomaly Alerts**: Unusual spending pattern detection

### Intelligence Features
- **Savings Calculations**: Precise monthly cost reduction estimates
- **Priority Ranking**: Color-coded urgency (warning, info, accent)
- **Actionable Steps**: Specific implementation guidance

## 🚦 Environment Configuration

The application automatically adapts based on your environment:

| Environment | Data Source | Filter State | Use Case |
|------------|-------------|--------------|----------|
| **Development** | Mock data | Persistent | Fast iteration |
| **Production + AWS** | Live AWS data | Persistent | Real monitoring |  
| **Production + No credentials** | Mock fallback | Persistent | Demo/testing |

## 🎯 Enhanced Metrics & Algorithms

### Smart Suggestions Logic
```typescript
function generateSmartSuggestions(instances: EC2Instance[]): Suggestion[] {
  const underutilized = instances.filter(i => i.cpuUtilization < 5);
  const potentialSavings = calculateOptimizationSavings(instances);
  
  return [
    {
      type: 'stop-underused',
      priority: 'high',
      instances: underutilized.length,
      savings: underutilized.reduce((sum, i) => sum + i.monthlyCost, 0)
    },
    {
      type: 'optimize-sizing',
      priority: 'medium', 
      savings: potentialSavings,
      description: 'Right-size overprovisioned instances'
    }
  ];
}
```

### Efficiency Score Enhancement
- **CPU Weight**: 40% (utilization vs capacity)
- **Memory Weight**: 40% (utilization vs capacity)  
- **Cost Efficiency**: 20% (performance per dollar)

### Waste Level Classification
- **Low Waste** (🟢): Efficiency score > 70, optimal utilization
- **Medium Waste** (🟡): Efficiency score 40-70, room for improvement
- **High Waste** (🔴): Efficiency score < 40, immediate action needed

## 🔒 Security & Best Practices

- **Minimal IAM Permissions**: Only necessary AWS actions
- **No Credential Storage**: Environment variables only
- **TypeScript Safety**: Full type coverage for reliable integration  
- **Component Isolation**: shadcn/ui ensures consistent, secure patterns
- **Error Boundaries**: Graceful degradation prevents data exposure
- **Accessibility**: WCAG 2.1 AA compliance with Radix UI primitives

## 🤝 Development

### Adding New Features
1. **Start with mock data** - Update `src/lib/mock-data.ts`
2. **Build with shadcn/ui** - Use semantic components and variants
3. **Add filter support** - Integrate with `useFilteredData` hook  
4. **Test responsiveness** - Ensure mobile and desktop layouts
5. **Add AWS integration** - Extend API routes when ready
6. **Run quality checks** - `npm run lint` before committing

### Extending the Filter System
```typescript
// Add new filter dimension
interface FilterCriteria {
  teams: string[];
  regions: string[];
  instanceTypes: string[];  // New dimension
  environments: string[];   // New dimension
}

// Update storage and hooks accordingly
const useFilteredData = (data, additionalFilters) => {
  // Enhanced filtering logic
};
```

### Creating Smart Suggestions
```typescript
// Add new suggestion type
interface Suggestion {
  type: 'stop-underused' | 'optimize-sizing' | 'schedule-shutdown' | 'new-type';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  savings?: number;
  instances?: number;
  icon: React.ComponentType;
}
```

## 📈 Production Deployment

Optimized for deployment on:
- **Vercel** (recommended - zero configuration with automatic Tailwind v4 support)
- **AWS Amplify** (with shadcn/ui component building)
- **Docker** containers (includes all dependencies)
- **Traditional hosting** with Node.js 18+ support

Environment variables are set in your hosting platform's dashboard.

## 🎨 Modern Branding & Design

This dashboard implements a complete modern design system:
- **Dark Theme Optimized**: Technical workflows with proper contrast ratios
- **shadcn/ui Components**: Accessible, consistent component library
- **Semantic Color System**: OKLCH format with CSS custom properties
- **Responsive Typography**: System fonts with proper scales
- **Professional Iconography**: Lucide React icon consistency

## 🚀 Performance Optimizations

- **Tailwind CSS v4**: CSS-first configuration for smaller bundles
- **Component Tree Shaking**: Only used shadcn/ui components included
- **Smart Caching**: localStorage for filter preferences
- **Efficient Re-renders**: React Context optimization
- **Modern Build Tools**: Turbopack for fast development iteration

---

**Transform your AWS cost optimization workflow** with intelligent recommendations and modern UI patterns! Start with `npm run dev` and discover actionable insights in seconds! ⚡

Built with ❤️ using modern React patterns, shadcn/ui design system, and intelligent cost optimization algorithms.