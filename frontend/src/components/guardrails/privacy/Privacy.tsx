import { useEffect, useState } from 'react';
import { usePage } from '../../../contexts/PageContext';
import { MetricCard } from '../../common/Card';
import { Box, Grid, Typography } from '@mui/material';
import PIIDetection from './PIIDetection';

export default function Privacy() {
  const { updatePage } = usePage();
  const [selectedView, setSelectedView] = useState<'overview' | 'pii-detection'>('overview');

  useEffect(() => {
    updatePage('Privacy', 'Data protection and privacy compliance controls');
  }, []); // Run only once on mount

  const handlePIIDetectionClick = () => {
    setSelectedView('pii-detection');
  };

  const handleBackToOverview = () => {
    setSelectedView('overview');
  };

  if (selectedView === 'pii-detection') {
    return <PIIDetection onBack={handleBackToOverview} />;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', marginBottom: 2 }}>
            Privacy Controls
          </Typography>
          <Typography variant="body1" sx={{ color: '#6c757d', fontSize: '1.125rem' }}>
            Data protection and privacy compliance management
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="PII Detection"
              value="847"
              subtitle="Click to view detailed logs and reports"
              accent="green"
              onClick={handlePIIDetectionClick}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Consent Management"
              value="98.5%"
              subtitle="User consent tracking"
              accent="purple"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="GDPR Compliance"
              value="Compliant"
              subtitle="Regulatory adherence"
              accent="green"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
