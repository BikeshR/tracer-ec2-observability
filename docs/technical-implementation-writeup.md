# Technical Implementation Writeup

## User Experience & Design

### Component Architecture & Information Hierarchy
- **Component Order**: Decided to order Cost Overview at the top, Cost Attribution in the middle, and EC2 Instance Utilisation Table last to create an information hierarchy that flows from higher level overview to more detailed analysis.
- **Grid Layout**: Implemented 4,3,2,1 cards per row for balanced visual presentation.

### User Assumptions
- **Bioinformaticians prefer efficiency over complexity**: Assumed users want actionable insights without deep AWS knowledge required.
- **Decision-making hierarchy**: Users start with high-level cost overview, then drill down to specific instances when issues are identified.
- **Team-based cost attribution**: Assumed research teams are the primary organizational unit for cost responsibility and tagging.

### Visual Design & Responsiveness
- **Tracer Branding**: Implemented favicon, logo, and dark mode only theme for brand consistency.
- **Grid Breakpoints**: Adaptive layout that collapses from 4-column to 2-column to single-column on smaller screens.
- **Table Responsiveness**: Horizontal scrolling for detailed EC2 table on mobile while maintaining readability.
- **Touch-friendly Interactions**: Appropriately sized buttons and touch targets for mobile usage.

---

## Component Implementation Details

### Feature Scope Decisions
- **Component 4 (Server Utilisation Timeline Graph)**: Decided not to implement this detailed feature with extensive interactivity, as the dashboard might not be the right page for it. This functionality would likely be better suited for deeper dive and analysis pages.
- **Real-time Updates**: Chose not to implement real-time updates (auto fetch with fetch interval), even though it's probably useful. The assumption is that users will primarily use this dashboard as a summarizing tool rather than for live monitoring of exactly what's being used at that moment in time (this might be a wrong assumption).

### Component 1: EC2 Instance Utilisation Table
- **Extended Columns**: Added additional columns to cover more comprehensive information about EC2 instances.
- **Visual Indicators**: Implemented percentage visualization using color coding and progress bars.
- **Sorting**: Made every column sortable, with default sorting by resource health.
- **Pagination**: Added pagination support for handling large numbers of EC2 instances.
- **Summary Information**: Included summary statistics at the bottom of the table card about the instances.

### Component 2: Cost Attribution
- **Left Card (Attribution Health)**: Focuses on higher-level information showing how much cost is accounted for through proper tagging with relevant groupings. Users can see how much is unattributed and inform relevant teams or persons to update those tags for better monitoring.
- **Right Card (Cost Breakdown)**: Displays cost breakdown by groups in both list view and pie chart view for flexible data visualization.

### Component 3: Cost Overview
- **KPI Cards**: Implemented simple, scannable KPI cards at the top level.
  - **Time Comparison**: Added comparison with previous time period so users can see improvement or deterioration trends.
  - **Positive Reframing**: Reworded "Waste" measurement to "Resource Efficiency" to put a more positive spin on the metric, helping users see it as a goal for numerical improvement.
  - **Visual Hierarchy**: Used background and border colors to reflect the status of efficiency, positioned at the top left for clear visual hierarchy. This card alone can serve as the main focal point users look at first to decide whether they want to investigate details further.
- **Smart Suggestions**: Added actionable recommendations so users can get ideas on optimization steps without having to manually analyze usage patterns.
- **Cost Pattern Analysis**: Designed to build out pattern analysis over time (weekly patterns and comparisons).
- **Recent Anomalies**: Shows anomalies that may not be visible at the current moment but are important for awareness.

### Component 5: Filtering System
- **UI Approach**: Explored alternative presentation methods (including tab-based views) but decided against them due to performance concerns.
- **Minimal Design**: Kept the interface minimal at the top of the dashboard with just a dropdown and button for managing views.
- **Persistence**: Implemented local storage persistence for user preferences.
- **Filter Options**: Filters can be applied for teams, regions, waste level, instance types, status, and job ID.

---

## Code Quality & Maintainability

- **TypeScript**: Full type safety across components with proper interfaces for EC2Instance, filter states, and API responses.
- **Component Library**: Selected shadcn component library for reusable, tried and
  tested components with built-in accessibility and consistent design patterns.
- **Component Architecture**: Modular design with reusable hooks (useFilteredData, useFilteredInstances) and context providers for state management.
- **Code Standards**: Implemented Biome for consistent formatting and linting instead of ESLint/Prettier combination.
- **Error Handling**: Graceful degradation with skeleton loading states and fallback to mock data when AWS APIs are unavailable.

---

## AWS Integration

- **SDK Implementation**: The AWS integration is functional using aws-sdk, but most development was done with mock data due to time constraints in configuring AWS services properly.
- **Data Source Toggle**: Added a switch in the header to toggle between mock data and real AWS data, allowing users to see components working with different data sources.
