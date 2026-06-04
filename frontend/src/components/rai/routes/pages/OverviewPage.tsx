// Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
// All Rights Reserved.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React from 'react';
import PageLayout from '../layouts/PageLayout';
import GuardrailsEffectivenessChart from '../../../common/GuardrailsEffectivenessChart';
import CostAnalysisChart from '../../charts/CostAnalysisChart';
import TrustScoreChartView1 from '../../charts/TrustScoreChartView1';
import ESGChart from '../../charts/ESGChart';

interface OverviewPageProps {
  trustScore?: number;
  adversarialMode?: boolean;
  onSectionChange?: (section: string) => void;
}

const OverviewPage: React.FC<OverviewPageProps> = ({
  trustScore,
  adversarialMode = false,
  onSectionChange
}) => {
  return (
    <PageLayout>
      {/* Main Dashboard Grid - Asymmetric layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column - Trust Score + ESG stacked */}
        <div className="space-y-6">
          {/* Trust Score Chart */}
          <div 
            className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Trust Score</h3>
              <p className="text-sm text-muted-foreground"></p>
            </div>
            <TrustScoreChartView1
              isRealTime={adversarialMode}
              isStressTest={false}
              size={320}
              trustScore={trustScore}
              onClick={() => onSectionChange?.('trust-analytics')}
              onMetricClick={(metricName) => {
                if (metricName === 'AI Safety') {
                  onSectionChange?.('performance-reliability');
                } else {
                  console.log(`Navigate to ${metricName} details`);
                }
              }}
            />
          </div>

          {/* ESG Chart - Moved up under Trust Score */}
          <div className="hover:shadow-md transition-shadow duration-200">
            <ESGChart
              isRealTime={adversarialMode}
              size={320}
              trustScore={trustScore}
              sustainabilityMetrics={{
                energy_kwh: 0.0003,
                carbon_g_co2: 0.066,
                water_liters: 0.0005,
                model_name: "gpt-4o"
              }}
              onClick={() => onSectionChange?.('ai-safety')}
              onCategoryClick={(category) => {
                if (category === 'Environmental') {
                  onSectionChange?.('sustainability-cost');
                } else {
                  console.log(`Navigate to ${category} ESG details`);
                }
              }}
            />
          </div>
        </div>

        {/* Right Column - Cost Analysis + Future Chart stacked */}
        <div className="space-y-6">
          {/* Cost Analysis Chart */}
          <div className="hover:shadow-md transition-shadow duration-200">
          <CostAnalysisChart
              isRealTime={adversarialMode}
              size={320}
              activeNetwork="default"
              tokenAccountingData={{
                // Last request / current sample
                total_tokens: 6329,
                prompt_tokens: 5707,
                completion_tokens: 622,

                // This block represents ONE successful request (the one shown on the card)
                successful_requests: 1,

                // Cost for that request (matches “Last Request $0.0205”)
                total_cost: 0.0205,

                // Duration from your screenshot
                time_taken_in_seconds: 12.60,

                // Per-model rollup (mirrors the top-level numbers so the chart can drill in)
                models: {
                  openai: {
                    "gpt-4o": {
                      total_tokens: 6329,
                      prompt_tokens: 5707,
                      completion_tokens: 622,
                      successful_requests: 1,
                      total_cost: 0.0205,
                      time_taken_in_seconds: 12.60
                    }
                  }
                }
              }}
              onClick={() => onSectionChange?.('sustainability-cost')}
              onCategoryClick={(category) => {
                console.log(`Navigate to ${category} cost details`);
              }}
            />
          </div>
          
          {/* Guardrails Effectiveness Chart */}
          <GuardrailsEffectivenessChart />
        </div>
      </div>   

     
    </PageLayout>
  );
};

export default OverviewPage;
