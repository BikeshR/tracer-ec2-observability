"use client";

import Image from "next/image";
import CostAttributionPanel from "@/components/CostAttributionPanel";
import CostOverview from "@/components/CostOverview";
import EC2Table from "@/components/EC2Table";
import { useInstancesKPI } from "@/hooks/useInstancesKPI";

export default function DashboardPage() {
  const { metrics, loading, error } = useInstancesKPI();

  return (
    <div className="min-h-screen bg-tracer-bg-primary">
      {/* Header */}
      <header className="bg-tracer-bg-primary border-b border-tracer-border">
        <div className="max-w-tracer mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Tracer Logo */}
              <Image
                src="/tracer-logo-only-white.svg"
                alt="Tracer"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <div className="h-6 w-px bg-tracer-border"></div>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-tracer-text-primary">
                  EC2 Observability Dashboard
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tracer-info/10 text-tracer-info border border-tracer-info/20">
                  Beta
                </span>
              </div>
            </div>

            <nav className="flex items-center">
              <a
                href="#instances"
                className="text-tracer-info font-medium text-sm hover:text-tracer-text-primary transition-colors px-3"
              >
                1. Instances
              </a>
              <div className="w-px h-4 bg-tracer-border"></div>
              <a
                href="#attribution"
                className="text-tracer-text-secondary text-sm hover:text-tracer-text-primary transition-colors px-3"
              >
                2. Attribution
              </a>
              <div className="w-px h-4 bg-tracer-border"></div>
              <a
                href="#costs"
                className="text-tracer-text-secondary text-sm hover:text-tracer-text-primary transition-colors px-3"
              >
                3. Cost Overview
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-tracer mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Description */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-tracer-text-primary">
                Infrastructure Overview
              </h2>
              <p className="mt-2 text-sm text-tracer-text-secondary max-w-2xl">
                Monitor your EC2 instances for cost optimization opportunities.
                Identify underutilized resources and potential savings across
                your cloud infrastructure.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-tracer-border rounded-md text-sm font-medium text-tracer-text-secondary bg-tracer-bg-secondary hover:bg-tracer-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tracer-focus transition-colors"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  role="img"
                >
                  <title>Export Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="relative mb-8">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(${parseInt("303030".slice(0, 2), 16)}, ${parseInt("303030".slice(2, 4), 16)}, ${parseInt("303030".slice(4, 6), 16)}, 0.3) 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            ></div>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-tracer-info/20 rounded-md flex items-center justify-center border border-tracer-info/30">
                    <svg
                      className="w-5 h-5 text-tracer-info"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-tracer-text-secondary">
                    Active Instances
                  </p>
                  <p className="text-2xl font-semibold text-tracer-text-primary">
                    {loading ? (
                      <span className="text-tracer-text-muted animate-pulse">
                        ...
                      </span>
                    ) : error ? (
                      <span className="text-tracer-error text-sm">Error</span>
                    ) : (
                      (metrics?.activeInstances ?? "--")
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-tracer-warning/20 rounded-md flex items-center justify-center border border-tracer-warning/30">
                    <svg
                      className="w-5 h-5 text-tracer-warning"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-tracer-text-secondary">
                    Underutilized
                  </p>
                  <p className="text-2xl font-semibold text-tracer-text-primary">
                    {loading ? (
                      <span className="text-tracer-text-muted animate-pulse">
                        ...
                      </span>
                    ) : error ? (
                      <span className="text-tracer-error text-sm">Error</span>
                    ) : (
                      (metrics?.underutilizedInstances ?? "--")
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-tracer-bg-secondary rounded-lg border border-tracer-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-tracer-success/20 rounded-md flex items-center justify-center border border-tracer-success/30">
                    <svg
                      className="w-5 h-5 text-tracer-success"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-tracer-text-secondary">
                    Potential Savings
                  </p>
                  <p className="text-2xl font-semibold text-tracer-text-primary">
                    {loading ? (
                      <span className="text-tracer-text-muted animate-pulse">
                        ...
                      </span>
                    ) : error ? (
                      <span className="text-tracer-error text-sm">Error</span>
                    ) : (
                      (metrics?.potentialSavings ?? "--")
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component 1: EC2 Instance Utilisation Table */}
        <section id="instances" className="mb-12">
          {/* Technical Section Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-tracer-border"></div>
            <div className="flex items-center px-4">
              <div className="w-2 h-2 bg-tracer-info rounded-full mr-2"></div>
              <span className="text-sm font-mono text-tracer-text-muted uppercase tracking-wider">
                EC2 Instance Utilisation
              </span>
              <div className="w-2 h-2 bg-tracer-info rounded-full ml-2"></div>
            </div>
            <div className="flex-1 h-px bg-tracer-border"></div>
          </div>
          <EC2Table />
        </section>

        {/* Component 2: Cost Attribution Panel */}
        <section id="attribution" className="mb-12">
          {/* Technical Section Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-tracer-border"></div>
            <div className="flex items-center px-4">
              <div className="w-2 h-2 bg-tracer-warning rounded-full mr-2"></div>
              <span className="text-sm font-mono text-tracer-text-muted uppercase tracking-wider">
                Cost Attribution Analysis
              </span>
              <div className="w-2 h-2 bg-tracer-warning rounded-full ml-2"></div>
            </div>
            <div className="flex-1 h-px bg-tracer-border"></div>
          </div>
          <CostAttributionPanel />
        </section>

        {/* Component 3: Live Cloud Cost Overview */}
        <section id="costs" className="mb-12">
          {/* Technical Section Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-tracer-border"></div>
            <div className="flex items-center px-4">
              <div className="w-2 h-2 bg-tracer-success rounded-full mr-2"></div>
              <span className="text-sm font-mono text-tracer-text-muted uppercase tracking-wider">
                Live Cost Analytics
              </span>
              <div className="w-2 h-2 bg-tracer-success rounded-full ml-2"></div>
            </div>
            <div className="flex-1 h-px bg-tracer-border"></div>
          </div>
          <CostOverview />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-tracer-bg-secondary border-t border-tracer-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-tracer-text-secondary">
              © 2024 Tracer EC2 Observability Dashboard
            </div>
            <div className="flex items-center space-x-6 text-sm text-tracer-text-muted">
              <span className="hover:text-tracer-text-secondary transition-colors cursor-pointer">
                Documentation
              </span>
              <span className="hover:text-tracer-text-secondary transition-colors cursor-pointer">
                Support
              </span>
              <span className="text-xs bg-tracer-bg-tertiary text-tracer-text-secondary px-2 py-1 rounded border border-tracer-border">
                Assessment Build
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
