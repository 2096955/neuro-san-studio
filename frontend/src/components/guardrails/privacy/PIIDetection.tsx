import { useEffect } from 'react';
import { usePage } from '../../../contexts/PageContext';
import { Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PIIDetectionProps {
  onBack?: () => void;
}

export default function PIIDetection({ onBack }: PIIDetectionProps) {
  const { updatePage } = usePage();

  useEffect(() => {
    updatePage('PII Detection', 'Personally Identifiable Information detection and protection');
  }, []); // Run only once on mount

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        {onBack && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ 
              marginBottom: 3,
              color: '#6c757d',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Back to Privacy Overview
          </Button>
        )}
        
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#000000', marginBottom: '16px' }}>
            PII Detection
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6c757d' }}>
            Automated detection and protection of personally identifiable information
          </p>
        </Box>
            
        {/* Detection Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-background border border-border/50 rounded-lg p-6">
            <div className="text-2xl font-bold text-primary mb-2">847</div>
            <div className="text-sm text-muted-foreground">PII Instances Detected</div>
          </div>
          <div className="bg-background border border-border/50 rounded-lg p-6">
            <div className="text-2xl font-bold text-secondary mb-2">99.2%</div>
            <div className="text-sm text-muted-foreground">Detection Accuracy</div>
          </div>
          <div className="bg-background border border-border/50 rounded-lg p-6">
            <div className="text-2xl font-bold text-primary mb-2">23</div>
            <div className="text-sm text-muted-foreground">Data Types Monitored</div>
          </div>
          <div className="bg-background border border-border/50 rounded-lg p-6">
            <div className="text-2xl font-bold text-secondary mb-2">Active</div>
            <div className="text-sm text-muted-foreground">Real-time Scanning</div>
          </div>
        </div>

        {/* PII Categories */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-card-foreground mb-6">Monitored PII Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background border border-border/50 rounded-lg p-4">
              <div className="text-lg font-medium text-primary mb-2">Personal Identifiers</div>
              <div className="text-sm text-muted-foreground">SSN, Driver's License, Passport Numbers</div>
            </div>
            <div className="bg-background border border-border/50 rounded-lg p-4">
              <div className="text-lg font-medium text-secondary mb-2">Contact Information</div>
              <div className="text-sm text-muted-foreground">Email, Phone, Physical Addresses</div>
            </div>
            <div className="bg-background border border-border/50 rounded-lg p-4">
              <div className="text-lg font-medium text-primary mb-2">Financial Data</div>
              <div className="text-sm text-muted-foreground">Credit Cards, Bank Accounts, Tax IDs</div>
            </div>
          </div>
        </div>
      </Box>
    </Box>
  );
}
