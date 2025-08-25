"use client";

import { useState, useEffect } from 'react';
import type { EC2Instance } from '@/lib/mock-data';

interface ApiResponse {
  instances: EC2Instance[];
  source: 'mock' | 'aws' | 'mock-fallback';
  timestamp: string;
  error?: string;
}

type SortField = 'name' | 'instanceType' | 'cpuUtilization' | 'costPerHour' | 'efficiencyScore' | 'wasteLevel';
type SortDirection = 'asc' | 'desc';

export default function EC2Table() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('efficiencyScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch EC2 data
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/instances');
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const apiData: ApiResponse = await response.json();
        setData(apiData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch instances');
        console.error('EC2Table fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  // Sort instances
  const sortedInstances = data?.instances ? [...data.instances].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle waste level sorting
    if (sortField === 'wasteLevel') {
      const wasteOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      aValue = wasteOrder[a.wasteLevel];
      bValue = wasteOrder[b.wasteLevel];
    }

    // Handle string vs number comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  // Handle column header clicks for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'efficiencyScore' ? 'asc' : 'desc'); // Default to ascending for efficiency, descending for others
    }
  };

  // Get waste level styling
  const getWasteLevelStyling = (wasteLevel: 'low' | 'medium' | 'high', efficiencyScore: number) => {
    switch (wasteLevel) {
      case 'high':
        return {
          bgClass: 'bg-red-50',
          textClass: 'text-red-700',
          badgeClass: 'bg-red-100 text-red-800',
          icon: '🔴',
          label: 'High Waste'
        };
      case 'medium':
        return {
          bgClass: 'bg-yellow-50',
          textClass: 'text-yellow-700',
          badgeClass: 'bg-yellow-100 text-yellow-800',
          icon: '🟡',
          label: 'Medium Waste'
        };
      case 'low':
        return {
          bgClass: 'bg-green-50',
          textClass: 'text-green-700',
          badgeClass: 'bg-green-100 text-green-800',
          icon: '🟢',
          label: 'Efficient'
        };
    }
  };

  // Get utilization styling
  const getUtilizationStyling = (utilization: number) => {
    if (utilization < 20) return 'text-red-600 font-semibold';
    if (utilization < 60) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-semibold';
  };

  // Get state styling
  const getStateStyling = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'shutting-down':
      case 'stopping':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4">Loading EC2 instances...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load EC2 Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.instances || data.instances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No EC2 Instances Found</h3>
          <p className="text-gray-600">
            {data?.source === 'aws' 
              ? 'No EC2 instances found in your AWS account.' 
              : 'No instance data available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">EC2 Instance Utilization</h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.instances.length} instance{data.instances.length !== 1 ? 's' : ''} found
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {data.source === 'aws' ? '🔗 Live AWS Data' : '🔧 Mock Data'}
              </span>
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Instance</span>
                  {sortField === 'name' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('cpuUtilization')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>CPU Usage</span>
                  {sortField === 'cpuUtilization' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Memory %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('costPerHour')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Cost/Hour</span>
                  {sortField === 'costPerHour' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('efficiencyScore')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Efficiency</span>
                  {sortField === 'efficiencyScore' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('wasteLevel')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Waste Alert</span>
                  {sortField === 'wasteLevel' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedInstances.map((instance) => {
              const wasteStyling = getWasteLevelStyling(instance.wasteLevel, instance.efficiencyScore);
              
              return (
                <tr 
                  key={instance.instanceId} 
                  className={`hover:bg-gray-50 ${wasteStyling.bgClass}`}
                >
                  {/* Instance Info */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">{instance.name}</div>
                      <div className="text-sm text-gray-500">
                        {instance.instanceType} • {instance.instanceId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {instance.region}
                      </div>
                    </div>
                  </td>

                  {/* CPU Utilization */}
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${getUtilizationStyling(instance.cpuUtilization)}`}>
                      {instance.cpuUtilization.toFixed(1)}%
                    </div>
                  </td>

                  {/* Memory Utilization */}
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${getUtilizationStyling(instance.memoryUtilization)}`}>
                      {instance.memoryUtilization.toFixed(1)}%
                    </div>
                  </td>

                  {/* Cost */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      ${instance.costPerHour.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${instance.monthlyCost.toFixed(2)}/month
                    </div>
                  </td>

                  {/* State */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateStyling(instance.state)}`}>
                      {instance.state}
                    </span>
                  </td>

                  {/* Efficiency Score */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-semibold ${wasteStyling.textClass}`}>
                        {instance.efficiencyScore}/100
                      </div>
                    </div>
                  </td>

                  {/* Waste Alert */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{wasteStyling.icon}</span>
                      <div>
                        <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${wasteStyling.badgeClass}`}>
                          {wasteStyling.label}
                        </div>
                        {instance.wasteLevel === 'high' && (
                          <div className="text-xs text-red-600 mt-1">
                            💰 Potential savings available
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <div>
            Showing {sortedInstances.length} of {data.instances.length} instances
          </div>
          <div>
            🔴 High Waste: {sortedInstances.filter(i => i.wasteLevel === 'high').length} • 
            🟡 Medium: {sortedInstances.filter(i => i.wasteLevel === 'medium').length} • 
            🟢 Efficient: {sortedInstances.filter(i => i.wasteLevel === 'low').length}
          </div>
        </div>
      </div>
    </div>
  );
}