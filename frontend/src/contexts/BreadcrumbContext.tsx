import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  updateBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Home', path: '/' }
  ]);

  const updateBreadcrumbs = (items: BreadcrumbItem[]) => {
    const homeItem = { label: 'Home', path: '/' };
    setBreadcrumbs([homeItem, ...items]);
  };

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs, updateBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
