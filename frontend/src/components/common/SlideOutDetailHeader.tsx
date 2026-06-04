import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, AccountTree, SmartToy, Settings } from '@mui/icons-material';

export interface SlideOutDetailHeaderProps {
  activeTab: 'overview' | 'graph' | 'agents-tools' | 'raw-config';
  onTabChange: (tab: 'overview' | 'graph' | 'agents-tools' | 'raw-config') => void;
  className?: string;
}

const SlideOutDetailHeader: React.FC<SlideOutDetailHeaderProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: <BarChart sx={{ fontSize: '1.125rem' }} /> },
    { id: 'graph' as const, label: 'Graph', icon: <AccountTree sx={{ fontSize: '1.125rem' }} /> },
    { id: 'agents-tools' as const, label: 'Agent & Tools', icon: <SmartToy sx={{ fontSize: '1.125rem' }} /> },
    { id: 'raw-config' as const, label: 'Raw Config', icon: <Settings sx={{ fontSize: '1.125rem' }} /> }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 0.5, 
      px: 2, 
      py: 0.5, 
      bgcolor: 'white'
    }} className={className}>
      {tabs.map((tab) => (
        <Box
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 1,
            borderRadius: 2,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.15s ease',
            bgcolor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
            border: activeTab === tab.id ? '1px solid #d1d5db' : '1px solid transparent',
            color: activeTab === tab.id ? '#374151' : '#6b7280',
            '&:hover': {
              bgcolor: activeTab === tab.id ? '#f3f4f6' : '#f9fafb',
              borderColor: '#d1d5db',
              color: '#374151'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</Box>
          <Typography sx={{ 
            fontSize: '0.875rem', 
            fontWeight: 500,
            color: 'inherit'
          }}>
            {tab.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default SlideOutDetailHeader;
