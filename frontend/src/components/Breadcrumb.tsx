import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext, Home as HomeIcon } from '@mui/icons-material';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumb({ className = "" }: BreadcrumbProps) {
  const { breadcrumbs } = useBreadcrumb();
  const navigate = useNavigate();

  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box className={className}>
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ 
          mb: 0.5,
          opacity: 0.6,
          '& .MuiBreadcrumbs-separator': {
            opacity: 0.5
          }
        }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHome = index === 0;
          
          if (isHome) {
            return (
              <Link
                key={index}
                component={item.path ? RouterLink : "span"}
                to={item.path || ""}
                underline="hover"
                color={isLast ? "text.primary" : "inherit"}
                onClick={() => handleBreadcrumbClick(item.path)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: isLast ? 'normal' : 'normal',
                  cursor: item.path ? 'pointer' : 'default',
                  fontSize: '0.75rem',
                  opacity: 0.7
                }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {item.label}
              </Link>
            );
          }
          
          return isLast ? (
            <Typography key={index} color="text.secondary" sx={{ fontWeight: 'normal', fontSize: '0.75rem', opacity: 0.7 }}>
              {item.icon && (
                <Box component="span" sx={{ mr: 0.5, display: 'inline-flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
              )}
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              component={item.path ? RouterLink : "span"}
              to={item.path || ""}
              underline="hover"
              color="inherit"
              onClick={() => handleBreadcrumbClick(item.path)}
              sx={{ 
                cursor: item.path ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                opacity: 0.7
              }}
            >
              {item.icon && (
                <Box component="span" sx={{ mr: 0.5, display: 'inline-flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
              )}
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
