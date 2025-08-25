# Tracer Cloud Recruitment Task
## Founding Product Engineer - EC2 Observability Prototype

**Input & Conversation are welcome.**

---

## Overview

### Objective:
- Your task is to design and build a front-end prototype that visualises EC2 cloud cost waste
- The goal is to create a tool that enables bioinformaticians to explore, interpret, and act on server utilisation patterns through a well-designed UI
- This prototype should help users make smarter infrastructure decisions without needing to understand the underlying cloud complexity

### Recruitment Assessment Structure:
**Take-Home Assessment:** Build a working frontend interface using real cloud metadata, including per EC2 server instance utilisation metrics and per-job cost attribution.

---

## Context

Tracer helps organisations gain visibility into their cloud infrastructure, usage, and cost. Our ideal users are technical teams working in research-intensive fields, such as life sciences and drug discovery, where large-scale computational workloads are common.

We are introducing a new capability focused on **EC2 server observability**, designed specifically for bioinformaticians and technical users who work with scientific workflows that rely on EC2 infrastructure.

### User Challenges:
- Understanding which servers are being used
- How efficiently they are operating  
- How infrastructure costs map to scientific jobs or teams

### Current State:
- Users typically rely on fragmented tools like spreadsheets, custom dashboards, or manual tagging within AWS to make sense of usage
- This is time-consuming and rarely gives a real-time, holistic view

**Tracer's goal** is to simplify this process by offering a purpose-built dashboard that makes EC2 server performance, usage, and cost data accessible and actionable. From a business standpoint, this supports our expansion into the life sciences vertical by addressing a clear and underserved user need.

---

## Assessment Details

### What You'll Need:
- Local development environment with **React** or **Next.js**
- An **AWS Account** (you can create one for free)
  - You are expected to build an AWS connection and extract EC2 instance data from your own AWS account
  - This includes creating the necessary API calls and provisioning IAM roles/policies (read-only) to allow access to EC2, CloudWatch, and Cost Explorer data
- Basic understanding of AWS or GCP instance types, billing, and resource metrics
- A basic script that deploys an EC2 read permission from an AWS account
- **(Optional)** Charting library of your choice (e.g., Recharts, Chart.js)

### Assessment Outline

The assignment will be split into **five UI components** that simulate a full, cloud-native observability console:

1. **EC2 instance utilisation table:** Build a user-friendly table view of EC2 servers that surfaces real-time usage and cost metrics
2. **Cost attribution panel** that breaks down costs for certain types of properties (be creative, choose different metadata properties such as region or instance type)
3. **Live Cloud Cost Overview:** Provide an easily scannable summary of total and projected costs across cloud providers

### Key Questions to Focus On:
1. **How much cloud cost have I wasted?**
2. **What are some actionable steps to reduce that cloud cost waste?**

> **Note:** This task is intentionally open-ended. Part of the assessment is seeing how you choose to interpret the problem, where you place emphasis, and what tradeoffs you make. We're looking not just at what you build, but how your decisions reflect the mindset of a founding product engineer.

---

## Component 1: EC2 Instance Utilisation Table

### Objective:
Allow users to explore and compare EC2 server usage, cost, and efficiency at a glance.

### Requirements:
- Display a table of EC2 instances with core metrics: **CPU, RAM, GPU, uptime, cost/hour**
- Use visual indicators (e.g., icons, color, bars) to flag underutilised or over-provisioned instances
- Support sorting and filtering by key metadata (region, instance type, utilisation)
- Include logic or indicators that help identify waste (e.g., low usage over long uptime)
- Incorporate at least one creative design or interaction element that helps a bioinformatician quickly see where resources are wasted without needing to read documentation

### Write-up Requirements:
- **A UX or design tradeoff** you made in the table layout
- **An assumption** you made about how users interpret "waste"
- **One feature** you intentionally chose not to build, and why

---

## Component 2: Cost Attribution Panel

### Objective:
Help users understand how EC2 costs map back to scientific jobs, teams, or infrastructure dimensions.

### Requirements:
- Break down EC2 costs using at least one metadata dimension (e.g., region, instance type, team, or job ID)
- Visualise the breakdown using toggleable views (e.g., table view and pie/bar chart)
- Clearly distinguish between **total** vs. **attributed** vs. **unaccounted** cost
- Allow comparison across different dimensions or time ranges
- Include at least one creative data presentation or interaction that makes it easier for a research team to identify cost patterns or anomalies
- Select metadata that would be most useful for a research team managing shared infrastructure, and explain your reasoning in your write-up

---

## Component 3: Live Cloud Cost Overview

### Objective:
Give users a high-level summary of current and projected cloud spend.

### Requirements:
- Show KPIs including **total cost** (AWS only is fine), **daily burn rate**, and **projected monthly spend**
- Display cost trend over time (24h or 7d) using a simple and scannable visual
- The layout should support decision-making: make the cost picture easy to absorb at a glance
- You may use simulated or static data to represent time-based cost changes
- Add visual cues for anomalies or unexpected spikes
- Design at least one creative visual or summary element that would help a decision maker quickly spot issues or take action without having to explore every metric

---

## Deliverables

1. **Source Code:** Provide the full frontend prototype in a GitHub repository shared with: `https://github.com/davincios`

2. **Product Write-Up:** Send a short technical document to `vincent@tracer.bio` that includes:
   - Design decisions, articulation of aesthetic decisions and tradeoffs you made
   - Assumptions about the user or system that shaped your UI
   - One feature you chose not to build, and why
   - Screenshots of the working UI with simulated data

---

## Evaluation Criteria

1. **Execution Ability:** Delivers a working, polished prototype on time. Meets core requirements, prioritizes effectively, and avoids major bugs.

2. **Ownership Mentality:** Makes clear, high-quality decisions, solves problems independently, and takes full responsibility for the result.

3. **Innovative Thinking:** Brings at least one original feature or approach that adds real value beyond the basics.

4. **Product Design Mindset:** Designs with the user in mind, with clear information hierarchy, intuitive navigation, and features that make the UI easier to understand.

5. **Creative Problem Solving:** Applies original thinking to data presentation, visual hierarchy, and interaction design to make complex AWS and cost data easier to interpret and act on.

---

## Appendix – Bonus Components
**(Not Required - Focus on 1-3)**

### Component 4: Server Utilisation Timeline Graph

#### Objective:
Allow users to inspect how an individual EC2 instance was used over time.

#### Requirements:
- Visualise CPU, RAM, and GPU usage over a time range (e.g., line graph with time on the x-axis)
- Support toggling between 1h, 24h, and 7d time windows
- Surface idle or spiky behaviour (e.g., via shading, annotations, or usage bands)
- Provide a simple UI to select a server and drill into its usage profile
- Consider how a user might interpret patterns in usage (e.g., underuse during off-hours)

### Component 5: Custom Filtering Layer

#### Objective:
Enable users to focus the dashboard on relevant infrastructure based on what matters to them.

#### Requirements:
- Provide filters for common metadata dimensions: region, instance type, owner, waste level, or job ID
- Filters should apply consistently across all dashboard components
- UI should support adding/removing filters and resetting the view easily
- **Optional:** Persist filter state across sessions or interactions
- Consider the experience of a user trying to isolate high-cost, low-efficiency resources quickly