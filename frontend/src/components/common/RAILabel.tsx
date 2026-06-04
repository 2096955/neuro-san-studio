import React from 'react';
import { Box, Typography } from '@mui/material';

interface RAILabelProps {
  score: 'A' | 'B' | 'C' | 'D' | 'E';
  title?: string;
}

export default function RAILabel({ score, title = 'RAI-SCORE' }: RAILabelProps) {
  const getScoreColor = (grade: string, isActive: boolean) => {
    if (!isActive) {
      return '#e5e7eb'; // Gray for inactive grades
    }
    
    switch (grade) {
      case 'A':
        return '#22c55e'; // Green
      case 'B':
        return '#84cc16'; // Light green
      case 'C':
        return '#eab308'; // Yellow
      case 'D':
        return '#f97316'; // Orange
      case 'E':
        return '#ef4444'; // Red
      default:
        return '#e5e7eb';
    }
  };

  const grades = ['A', 'B', 'C', 'D', 'E'];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: 2
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#6c757d',
          marginBottom: 1,
          letterSpacing: '0.05em'
        }}
      >
        {title}
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        borderRadius: '25px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '2px solid #ffffff'
      }}>
        {grades.map((grade, index) => {
          const isActive = grade === score;
          const backgroundColor = getScoreColor(grade, isActive);
          
          return (
            <Box
              key={grade}
              sx={{
                width: '50px',
                height: '50px',
                backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                ...(isActive && {
                  transform: 'scale(1.1)',
                  zIndex: 2,
                  boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '50%',
                  margin: '0 -5px'
                })
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : (grade === 'A' || grade === 'B' ? '#ffffff' : '#000000'),
                  textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
                }}
              >
                {grade}
              </Typography>
            </Box>
          );
        })}
      </Box>
      
      <Typography 
        variant="body2" 
        sx={{ 
          fontSize: '0.6875rem',
          color: '#6c757d',
          marginTop: 1,
          textAlign: 'center'
        }}
      >
        Overall AI System Rating
      </Typography>
    </Box>
  );
}
