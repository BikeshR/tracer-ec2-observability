"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import CostAttributionPanel from "@/components/CostAttributionPanel";
import CostOverview from "@/components/CostOverview";
import DataSourceToggle from "@/components/DataSourceToggle";
import EC2Table from "@/components/EC2Table";
import { FilterProvider, FilterSystem } from "@/components/filters";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize lastRefresh only on client to avoid hydration mismatch
  useEffect(() => {
    setLastRefresh(new Date());
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
    // In real implementation, this would trigger data refetch
  };

  return (
    <FilterProvider>
      <div className="min-h-screen bg-background">
        {/* Professional Observability Header */}
        <header className="bg-secondary/90 backdrop-blur supports-[backdrop-filter]:bg-secondary/70 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section: Branding & Context */}
              <div className="flex items-center space-x-4">
                {/* Tracer Logo with enhanced styling */}
                <div className="flex items-center space-x-3">
                  <div className="relative p-1.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                    <Image
                      src="/tracer-logo-only-white.svg"
                      alt="Tracer"
                      width={24}
                      height={24}
                      className="h-6 w-6 flex-shrink-0"
                    />
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                </div>

                {/* Title Section */}
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    EC2 Observability Dashboard
                  </h1>
                </div>
              </div>

              {/* Right Section: Status, Data & Actions */}
              <div className="flex items-center space-x-4">
                {/* Data Source Toggle */}
                <div className="hidden lg:flex items-center space-x-3">
                  <DataSourceToggle />
                  <span className="text-xs text-muted-foreground">
                    {lastRefresh?.toLocaleTimeString() || "--:--:--"}
                  </span>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 px-3 hover:bg-background"
                  title="Refresh Data"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* 🆕 COMPONENT 5: Persistent Filter System */}
            <FilterSystem />

            <CostOverview />

            <CostAttributionPanel />

            <EC2Table />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-secondary/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-muted-foreground">
              © 2025 Tracer EC2 Observability Dashboard
            </div>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}
