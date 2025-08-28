# EC2 Observability Dashboard

AWS EC2 cost optimization dashboard that helps identify cloud waste and provides actionable recommendations. Works with mock data by default, optionally connects to real AWS.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![AWS](https://img.shields.io/badge/AWS-SDK_v3-orange)

## ✨ Features

- **Smart Suggestions**: Identifies underused instances and calculates potential savings
- **Waste Detection**: Color-coded efficiency scoring (🔴🟡🟢) for quick identification
- **Interactive Table**: Sortable columns with real-time filtering
- **Custom Filters**: Save and manage personalized filter views
- **AWS Integration**: Automatic fallback to mock data when AWS unavailable
- **Modern UI**: Built with shadcn/ui components and dark theme

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd tracer-ec2-observability
npm install

# Start development server (uses mock data)
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard.

**Note**: Works with mock data by default. No AWS setup required to start.

## 🔗 AWS Setup (Optional)

To use real AWS data instead of mock data:

1. **Set environment variables**:
   ```bash
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret" 
   export AWS_REGION="us-east-1"
   ```

2. **Required IAM permissions**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["ec2:DescribeInstances", "ce:GetCostAndUsage"],
         "Resource": "*"
       }
     ]
   }
   ```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/instances/          # EC2 data API
│   ├── dashboard/              # Main dashboard
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── filters/                # Filter system
│   ├── EC2Table.tsx            # Main data table
│   └── CostOverview.tsx        # Analytics panel
└── lib/mock-data.ts            # Sample data
```

## 🔧 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

## 🛠 Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **AWS**: AWS SDK v3 (EC2 + Cost Explorer)
- **Build**: Turbopack








## 🛠 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run build`
5. Submit a pull request
## 📈 Deployment

Deploys easily on Vercel, AWS Amplify, or any Node.js hosting. Set AWS environment variables for live data integration.

---

Start exploring: `npm run dev` 🚀