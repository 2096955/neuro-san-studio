import React, { useState } from 'react';
import { 
  Typography, 
  Box
} from '@mui/material';
import Breadcrumb from './Breadcrumb';
import { usePage } from '../contexts/PageContext';
import { useSelectedSystem } from '../contexts/SelectedSystemContext';
import SystemSelector from './common/SystemSelector';
import SlideOutPage from '../pages/SlideOutPage';

interface HeaderProps {
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export default function Header({ 
  showBreadcrumb = true,
  actions,
  className = ''
}: HeaderProps) {
  const { pageData } = usePage();
  const { selectedSystem } = useSelectedSystem();
  const [isAISystemsOpen, setIsAISystemsOpen] = useState(false);

  return (
    <>
      <Box 
        className={className}
        sx={{ 
          width: '100%', 
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ px: 3, py: 0 }}>
          {/* Modular Breadcrumb Component */}
          {showBreadcrumb && <Breadcrumb />}

          {/* Header Content */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* MUI Typography for Title with Selected System */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    opacity: 0.8
                  }}
                >
                  {pageData.title}{pageData.section && ` - ${pageData.section}`}
                </Typography>
                
                {/* Selected System Name */}
                {selectedSystem && (
                  <>
                    <Typography 
                      variant="h6" 
                      component="span" 
                      sx={{ 
                        fontWeight: 'medium',
                        color: 'text.secondary',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        lineHeight: 1.2,
                        opacity: 0.5
                      }}
                    >
                      /
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="span" 
                      sx={{ 
                        fontWeight: 'semibold',
                        color: 'primary.main',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        opacity: 1
                      }}
                    >
                      {selectedSystem.metadata.system}
                    </Typography>
                  </>
                )}
              </Box>
              
              {/* MUI Typography for Subtitle */}
              {pageData.subtitle && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 0.25,
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    lineHeight: 1.3,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {pageData.subtitle}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 1, 
              flexShrink: 0,
              flexWrap: 'wrap',
              mt: -1
            }}>
              {/* AI Systems Button */}
              <HeaderButton
                onClick={() => setIsAISystemsOpen(true)}
                variant="outlined"
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                </svg>
                AI Use Cases
              </HeaderButton>
              
              {/* Custom Actions */}
              {actions}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* AI Systems Slide-out Page */}
      <SlideOutPage
        isOpen={isAISystemsOpen}
        onClose={() => setIsAISystemsOpen(false)}
      />
    </>
  );
}

// Pre-built action components using MUI
export const HeaderButton = ({ 
  children, 
  onClick, 
  variant = "outlined",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "contained" | "outlined" | "text";
  className?: string;
}) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm ${
        variant === 'contained' 
          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
          : variant === 'outlined'
          ? 'bg-card hover:bg-muted text-card-foreground border border-border/50 hover:border-border'
          : 'bg-transparent hover:bg-muted text-card-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const HeaderIconButton = ({ 
  children, 
  onClick, 
  title,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}) => {
  return (
    <Box
      component="button"
      onClick={onClick}
      title={title}
      className={className}
      sx={{
        p: 1,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        color: 'text.primary',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
          transform: 'scale(1.05)'
        },
        '&:active': {
          transform: 'scale(0.95)'
        }
      }}
    >
      <Box sx={{ 
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.1)' }
      }}>
        {children}
      </Box>
    </Box>
  );
};

export const HeaderSearch = ({ 
  className = ""
}: {
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <SystemSelector 
        label="AI System"
        placeholder="Select system to monitor"
        width={280}
        onChange={(system) => {
          console.log('Selected AI System:', system);
        }}
      />
    </div>
  );
};
