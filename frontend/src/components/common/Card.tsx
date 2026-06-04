import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: '8px',
  '& .MuiCardHeader-title': {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#000000',
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '4px',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: '0',
  '&:last-child': {
    paddingBottom: '24px',
  },
}));

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  accent?: 'green' | 'purple' | 'none';
}

export default function Card({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  onClick,
  hoverable = true,
  accent = 'none'
}: CardProps) {
  const getAccentColor = () => {
    switch (accent) {
      case 'green':
        return '#22c55e';
      case 'purple':
        return '#8b5cf6';
      default:
        return 'transparent';
    }
  };

  return (
    <StyledCard 
      className={className}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': hoverable ? {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)',
        } : {},
        borderTop: accent !== 'none' ? `3px solid ${getAccentColor()}` : undefined,
      }}
    >
      {title && (
        <StyledCardHeader
          title={title}
          subheader={subtitle}
          sx={{
            '& .MuiCardHeader-title': {
              color: accent !== 'none' ? getAccentColor() : '#000000',
            }
          }}
        />
      )}
      <StyledCardContent>
        {children}
      </StyledCardContent>
    </StyledCard>
  );
}

// Metric Card variant for displaying key metrics
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'green' | 'purple' | 'none';
  className?: string;
  onClick?: () => void;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  accent = 'none',
  className = '',
  onClick 
}: MetricCardProps) {
  const getAccentColor = () => {
    switch (accent) {
      case 'green':
        return '#22c55e';
      case 'purple':
        return '#8b5cf6';
      default:
        return '#000000';
    }
  };

  return (
    <Card 
      className={className} 
      onClick={onClick}
      accent={accent}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: '2rem',
            fontWeight: 700,
            color: getAccentColor(),
            marginBottom: '8px'
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1rem',
            fontWeight: 600,
            color: '#000000',
            marginBottom: '4px'
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.875rem',
              color: '#6c757d'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
