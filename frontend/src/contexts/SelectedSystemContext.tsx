import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { SystemCardData } from '../components/common/SystemCards';

interface SelectedSystemContextType {
  selectedSystem: SystemCardData | null;
  setSelectedSystem: (system: SystemCardData | null) => void;
}

const SelectedSystemContext = createContext<SelectedSystemContextType | undefined>(undefined);

export const SelectedSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSystem, setSelectedSystem] = useState<SystemCardData | null>(null);

  return (
    <SelectedSystemContext.Provider value={{ selectedSystem, setSelectedSystem }}>
      {children}
    </SelectedSystemContext.Provider>
  );
};

export const useSelectedSystem = () => {
  const context = useContext(SelectedSystemContext);
  if (context === undefined) {
    throw new Error('useSelectedSystem must be used within a SelectedSystemProvider');
  }
  return context;
};
