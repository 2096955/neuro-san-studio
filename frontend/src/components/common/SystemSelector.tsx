import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

export interface AISystem {
  id: string;
  name: string;
  description?: string;
}

interface SystemSelectorProps {
  value?: AISystem | null;
  onChange?: (system: AISystem | null) => void;
  onSystemChange?: (systemId: string | null) => void;
  label?: string;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
  loading?: boolean;
  fetchSystems?: () => Promise<AISystem[]>;
  systems?: AISystem[];
}

// Default systems for development/testing
const defaultSystems: AISystem[] = [
  {
    id: 'air-ticket',
    name: 'Air Ticket',
    description: 'AI system for flight booking and travel recommendations'
  },
  {
    id: 'music-nerd',
    name: 'Music Nerd',
    description: 'AI system for music discovery and recommendations'
  }
];

export default function SystemSelector({
  value,
  onChange,
  onSystemChange,
  label = "AI System",
  placeholder = "Select an AI system",
  width = 300,
  disabled = false,
  loading: externalLoading = false,
  fetchSystems,
  systems: externalSystems
}: SystemSelectorProps) {
  const [systems, setSystems] = useState<AISystem[]>(externalSystems || defaultSystems);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<AISystem | null>(value || null);

  // Load systems from API if fetchSystems function is provided
  useEffect(() => {
    if (fetchSystems && !externalSystems) {
      setInternalLoading(true);
      fetchSystems()
        .then((fetchedSystems) => {
          setSystems(fetchedSystems);
        })
        .catch((error) => {
          console.error('Failed to fetch AI systems:', error);
          // Fallback to default systems on error
          setSystems(defaultSystems);
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [fetchSystems, externalSystems]);

  // Update systems when external systems prop changes
  useEffect(() => {
    if (externalSystems) {
      setSystems(externalSystems);
    }
  }, [externalSystems]);

  // Update selected system when value prop changes
  useEffect(() => {
    setSelectedSystem(value || null);
  }, [value]);

  const handleSystemChange = (event: any, newValue: AISystem | null) => {
    setSelectedSystem(newValue);
    
    // Call both callback functions if provided
    if (onChange) {
      onChange(newValue);
    }
    
    if (onSystemChange) {
      onSystemChange(newValue?.id || null);
    }
  };

  const isLoading = internalLoading || externalLoading;

  return (
    <Autocomplete
      disablePortal
      options={systems}
      value={selectedSystem}
      onChange={handleSystemChange}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isLoading}
      disabled={disabled || isLoading}
      sx={{ width }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <div style={{ fontWeight: 'medium' }}>{option.name}</div>
            {option.description && (
              <div style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                {option.description}
              </div>
            )}
          </div>
        </li>
      )}
    />
  );
}
