// Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
// All Rights Reserved.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../components/Card';
import GuardrailHealthBarChart from '../../charts/GuardrailHealthBarChart';
import PIILeakageChartSSE from '../../charts/PIILeakageChartSSE';
import BiasDetectionChartSSE from '../../charts/BiasDetectionChartSSE';
import ToxicityChartSSE from '../../charts/ToxicityChartSSE';
import Filters, { type FilterOption } from '../../../common/Filters';
import { useGuardrailsHistory } from '../../../../hooks/useGuardrailsHistory';

// Dashboard-specific filter options for real-time RAI monitoring
const dashboardFilterOptions: FilterOption[] = [
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

interface DashboardPageProps {
  trustScore?: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({  }) => {
  // State for filter
  const [selectedFilter, setSelectedFilter] = useState<string>('1h');

  // Use custom hook for historical data with async loading
  const {
    data: historicalData,
    isLoading: isLoadingHistory,
    error: historyError,
    aggregatedByCategory,
    timeSeriesData
  } = useGuardrailsHistory({
    timeFilter: selectedFilter,
    autoFetch: true
  });

  const handleFilterChange = (value: string) => {
    console.log('Dashboard filter changed to:', value);
    setSelectedFilter(value);
  };

  // Log aggregated data for debugging (available for charts to use)
  React.useEffect(() => {
    if (aggregatedByCategory) {
      console.log('📊 Aggregated by category:', aggregatedByCategory);
    }
    if (timeSeriesData) {
      console.log('📈 Time series data:', timeSeriesData);
    }
  }, [aggregatedByCategory, timeSeriesData]);

  const handleDateRangeChange = (dateRange: any) => {
    console.log('Date range changed:', dateRange);
    // Add your date range logic here
  };

  return (
    <PageLayout>
      {/* Dashboard Header with Filters */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RAI Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and analytics
            {isLoadingHistory && (
              <span className="ml-2 text-sm text-blue-600">
                • Loading historical data...
              </span>
            )}
            {historyError && (
              <span className="ml-2 text-sm text-red-600">
                • {historyError}
              </span>
            )}
            {historicalData && !isLoadingHistory && (
              <span className="ml-2 text-sm text-green-600">
                • {historicalData.total_records} records loaded
              </span>
            )}
          </p>
        </div>
        <Filters 
          options={dashboardFilterOptions}
          selectedValue={selectedFilter}
          onFilterChange={handleFilterChange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* Trust Score and Bias Detection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: PII Leakage + Risk Categories */}
        <div className="space-y-6">
          {/* PII Leakage Section - Historical + Real-time SSE */}
          <PIILeakageChartSSE 
            mode="donut" 
            timeFilter={selectedFilter}
          />
        </div>

        {/* Right Column: Bias Detection */}
        <div>
          <BiasDetectionChartSSE mode="radar" timeFilter={selectedFilter} />
        </div>
      </div>

      {/* Toxicity Chart Section */}
      <div className="mb-8">
        <Card title="Toxicity Detection Trends" subtitle="Real-time monitoring of toxicity trigger detections">
          <div className="p-4">
            <ToxicityChartSSE timeFilter={selectedFilter} />
          </div>
        </Card>
      </div>

      {/* Guardrail Health Section */}
      <div className="mb-8">
        <Card title="Guardrail Health" subtitle="Safety and compliance health of selected AI system">
          <div className="p-4">
            <GuardrailHealthBarChart />
          </div>
        </Card>
      </div>

      {/* Risk Type Occurrence Section */}
      <div className="mb-8">
        <Card title="Risk Type Occurrence" subtitle="Number of risks across use cases grouped by type">
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Privacy</span>
              <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <span className="text-sm font-medium">20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Performance & Robustness</span>
              <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '90%'}}></div>
              </div>
              <span className="text-sm font-medium">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fairness & Bias</span>
              <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <span className="text-sm font-medium">15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Explainability & Transparency</span>
              <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '70%'}}></div>
              </div>
              <span className="text-sm font-medium">14</span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
