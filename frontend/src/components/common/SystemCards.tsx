import React, { useState } from 'react';
import Card from './Card';
import { Box, Typography, Grid } from '@mui/material';

export interface SystemCardData {
  id: string;
  title: string;
  subtitle: string;
  badge: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
  icon: React.ReactNode;
  metadata: {
    type: string;
    riskLevel: string;
    system: string;
    connections: number;
    model: string;
    toolCount: number;
  };
  content: React.ReactNode;
  description?: string;
}

export interface SystemCardsProps {
  systems: SystemCardData[];
  loading?: boolean;
  error?: string;
  onSystemSelect?: (system: SystemCardData) => void;
  selectedSystemId?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const SystemCards: React.FC<SystemCardsProps> = ({
  systems,
  loading = false,
  error,
  onSystemSelect,
  selectedSystemId,
  searchable = false,
  searchPlaceholder = 'Search systems...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  // Filter systems based on search and risk level
  const filteredSystems = systems.filter(system => {
    const matchesSearch = searchTerm === '' || 
      system.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      system.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = selectedRisk === 'all' || 
      system.metadata.riskLevel === selectedRisk;
    
    return matchesSearch && matchesRisk;
  });



  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6 }}>
        <Box sx={{ 
          width: 40, 
          height: 40, 
          border: '3px solid #e0e0e0',
          borderTop: '3px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} />
        <Typography sx={{ ml: 2, color: '#6c757d' }}>
          Loading AI systems...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        bgcolor: '#fef2f2', 
        border: '1px solid #fecaca', 
        borderRadius: 2, 
        p: 3, 
        m: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <svg style={{ width: 20, height: 20, color: '#f87171', marginRight: 8 }} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <Typography sx={{ color: '#991b1b', fontWeight: 500 }}>
            Error loading AI systems
          </Typography>
        </Box>
        <Typography sx={{ color: '#dc2626', fontSize: '0.875rem', mt: 1 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>

      {/* Filters */}
      {searchable && (
        <Box sx={{ 
          bgcolor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: 2, 
          p: 3, 
          mb: 3 
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', mb: 1 }}>
                Search Systems
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <svg 
                  style={{ 
                    position: 'absolute', 
                    left: 12, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    width: 16, 
                    height: 16, 
                    color: '#9ca3af' 
                  }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', mb: 1 }}>
                Risk Level
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Box
                  onClick={() => setSelectedRisk('all')}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: selectedRisk === 'all' ? '#f3f4f6' : 'transparent',
                    border: selectedRisk === 'all' ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                    color: selectedRisk === 'all' ? '#374151' : '#6b7280',
                    '&:hover': {
                      bgcolor: '#f9fafb',
                      borderColor: '#d1d5db'
                    }
                  }}
                >
                  All
                </Box>
                <Box
                  onClick={() => setSelectedRisk('high')}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: selectedRisk === 'high' ? '#fef2f2' : 'transparent',
                    border: selectedRisk === 'high' ? '1px solid #fecaca' : '1px solid #e5e7eb',
                    color: selectedRisk === 'high' ? '#dc2626' : '#6b7280',
                    '&:hover': {
                      bgcolor: '#fef2f2',
                      borderColor: '#fecaca'
                    }
                  }}
                >
                  High
                </Box>
                <Box
                  onClick={() => setSelectedRisk('medium')}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: selectedRisk === 'medium' ? '#fffbeb' : 'transparent',
                    border: selectedRisk === 'medium' ? '1px solid #fed7aa' : '1px solid #e5e7eb',
                    color: selectedRisk === 'medium' ? '#d97706' : '#6b7280',
                    '&:hover': {
                      bgcolor: '#fffbeb',
                      borderColor: '#fed7aa'
                    }
                  }}
                >
                  Medium
                </Box>
                <Box
                  onClick={() => setSelectedRisk('low')}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: selectedRisk === 'low' ? '#f0fdf4' : 'transparent',
                    border: selectedRisk === 'low' ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                    color: selectedRisk === 'low' ? '#16a34a' : '#6b7280',
                    '&:hover': {
                      bgcolor: '#f0fdf4',
                      borderColor: '#bbf7d0'
                    }
                  }}
                >
                  Low
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Systems Grid */}
      {filteredSystems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <svg style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 16px' }}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11H5m14-7H5m14 14H5" />
          </svg>
          <Typography sx={{ color: '#6b7280', fontSize: '1.125rem' }}>
            No AI systems found
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem', mt: 0.5 }}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredSystems.map((system) => (
            <Grid item xs={12} sm={6} lg={4} key={system.id}>
              <Card
                onClick={() => onSystemSelect?.(system)}
                hoverable={true}
                accent="none"
                className={selectedSystemId === system.id ? 'selected' : ''}
              >
                <Box sx={{ p: 1 }}>
                  {/* Header with title and risk level */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                      <Typography sx={{ 
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#111827',
                        mb: 0.5,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {system.title}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {system.subtitle}
                      </Typography>
                    </Box>
                    
                    {/* Risk level badge in top right */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      px: 2,
                      py: 0.75,
                      borderRadius: 3,
                      bgcolor: system.metadata.riskLevel === 'high' ? '#fef2f2' : 
                               system.metadata.riskLevel === 'medium' ? '#fffbeb' : '#f0fdf4',
                      border: `1px solid ${system.metadata.riskLevel === 'high' ? '#fecaca' : 
                                            system.metadata.riskLevel === 'medium' ? '#fed7aa' : '#bbf7d0'}`,
                      flexShrink: 0
                    }}>
                      <Typography sx={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        color: system.metadata.riskLevel === 'high' ? '#dc2626' : 
                               system.metadata.riskLevel === 'medium' ? '#d97706' : '#16a34a',
                        letterSpacing: '0.025em'
                      }}>
                        {system.metadata.riskLevel.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Modern inline metadata */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1.5, 
                    mb: 2,
                    alignItems: 'center'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      bgcolor: '#f8fafc',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                        {system.metadata.type}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      bgcolor: '#f0f9ff',
                      borderRadius: 3,
                      border: '1px solid #bae6fd'
                    }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 500 }}>
                        {system.metadata.model}
                      </Typography>
                    </Box>
                    
                    {/* Connections and tools commented out */}
                    {/* <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5
                    }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {system.metadata.connections} connections
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        •
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {system.metadata.toolCount} tools
                      </Typography>
                    </Box> */}
                  </Box>

                  {/* Description section */}
                  {system.description && (
                    <Typography sx={{ 
                      fontSize: '0.8rem', 
                      color: '#475569', 
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.5
                    }}>
                      {system.description}
                    </Typography>
                  )}

                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SystemCards;
