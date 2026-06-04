/**
 * Sliding RAI Agent Container
 * 
 * A sliding panel that appears from the top when RAI Agentic Network is clicked.
 * Pushes content down instead of overlaying it.
 * Fetches and displays RAI_Agents.hocon network.
 */

import React, { useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Close, Hub } from '@mui/icons-material';
import RAIFlowGraph from './RAIFlowGraph';
import { API_BASE_URL } from '../../config/api';

export interface SlidingRAIAgentContainerProps {
  isOpen: boolean;
  onClose: () => void;
  systemName?: string;
  className?: string;
  raiNetworkData?: any; // Cached RAI network data
  onDataFetched?: (data: any) => void; // Callback to cache data
}

const SlidingRAIAgentContainer: React.FC<SlidingRAIAgentContainerProps> = ({
  isOpen,
  onClose,
  systemName = 'AI System',
  className = '',
  raiNetworkData,
  onDataFetched
}) => {
  const [networkData, setNetworkData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch RAI_Agents.hocon when component mounts (only once)
  useEffect(() => {
    const fetchRAINetwork = async () => {
      // Use cached data if available
      if (raiNetworkData) {
        setNetworkData(raiNetworkData);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/systems/rai-agents`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch RAI network: ${response.statusText}`);
        }

        const data = await response.json();
        setNetworkData(data);
        
        // Cache the data in parent component
        if (onDataFetched) {
          onDataFetched(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load RAI network';
        setError(errorMessage);
        console.error('Error fetching RAI network:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRAINetwork();
  }, [raiNetworkData, onDataFetched]);

  return (
    <Box
      sx={{
        height: isOpen ? '400px' : '0px',
        overflow: 'hidden',
        transition: 'height 0.3s ease-in-out',
        borderBottom: isOpen ? '1px solid #e5e7eb' : 'none',
        bgcolor: 'white',
        boxShadow: isOpen ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
      }}
      className={className}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid #e5e7eb',
          bgcolor: '#f9fafb',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Hub sx={{ color: '#8b5cf6', fontSize: '1.5rem' }} />
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
              RAI Agentic Network
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Monitoring {systemName}
            </Typography>
          </Box>
        </Box>
        
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#6b7280',
            '&:hover': {
              bgcolor: '#e5e7eb',
              color: '#111827',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          height: 'calc(100% - 60px)',
          overflow: 'hidden',
          p: 2,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <Typography sx={{ ml: 2, color: '#6b7280' }}>Loading RAI network...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ color: '#ef4444' }}>{error}</Typography>
          </Box>
        ) : networkData ? (
          <Box sx={{ height: '100%', width: '100%' }}>
            <RAIFlowGraph 
              systemName="RAI_Agents"
              layoutDirection="TB"
              className="w-full h-full"
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography sx={{ color: '#6b7280' }}>No RAI network data available</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SlidingRAIAgentContainer;
