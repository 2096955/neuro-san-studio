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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'purple';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  showText = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-8',
          icon: 'w-8 h-8 text-lg',
          text: 'text-sm'
        };
      case 'lg':
        return {
          container: 'h-16',
          icon: 'w-16 h-16 text-4xl',
          text: 'text-2xl'
        };
      default: // md
        return {
          container: 'h-12',
          icon: 'w-12 h-12 text-2xl',
          text: 'text-xl'
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return {
          icon: 'text-gray-800',
          text: 'text-gray-800'
        };
      case 'purple':
        return {
          icon: 'text-purple-600',
          text: 'text-purple-600'
        };
      default: // light
        return {
          icon: 'text-white',
          text: 'text-blue-900'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className={`flex items-center gap-1 ${sizeClasses.container} ${className}`}>
      {/* Logo Icon */}
      <svg 
        className="w-12 h-12 flex-shrink-0" 
        fill="none" 
        viewBox="0 0 32 32"
      >
        {/* Shield background */}
        <path 
          d="M16 2L6 6v8c0 6.627 4.373 12.627 10 14 5.627-1.373 10-7.373 10-14V6l-10-4z" 
          fill="url(#greenShieldGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        
        {/* Inner shield design */}
        <path 
          d="M16 4L8 7v7c0 5.523 3.477 10.523 8 12 4.523-1.477 8-6.477 8-12V7l-8-3z" 
          fill="rgba(255,255,255,0.15)"
        />
        
        {/* Central emblem - letter C */}
        <path 
          d="M16 8c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.157-.671 4.243-1.757l-1.415-1.415C18.157 17.499 17.157 18 16 18c-2.209 0-4-1.791-4-4s1.791-4 4-4c1.157 0 2.157.501 2.828 1.172l1.415-1.415C19.157 8.671 17.657 8 16 8z" 
          fill="white"
        />
        
        {/* Green gradient definition */}
        <defs>
          <linearGradient id="greenShieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <div className="ml-1">
          <div className={`font-bold ${sizeClasses.text} ${variantClasses.text} whitespace-nowrap`}>
            Cognizant Trust™
          </div>
          <div className="flex items-center gap-1">
            <div className={`text-xs ${variantClasses.text} mt-0.5 opacity-80`}>
              Responsible AI Platform
            </div>
            <Tooltip title="View AI Architecture Diagram" arrow placement="right">
              <IconButton
                size="small"
                onClick={() => navigate('/rai?section=trust-framework')}
                sx={{
                  padding: '2px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <InfoOutlinedIcon 
                  sx={{ 
                    fontSize: 14, 
                    color: variantClasses.text === 'text-blue-900' ? '#1e3a8a' : 'inherit',
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                    }
                  }} 
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
