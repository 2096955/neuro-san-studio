import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PageMetadata {
  title: string;
  subtitle?: string;
  section?: string;
}

interface PageContextType {
  pageData: PageMetadata;
  setPageData: (data: PageMetadata) => void;
  updatePage: (title: string, subtitle?: string, section?: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [pageData, setPageData] = useState<PageMetadata>({
    title: 'RAI Trust & Governance',
    subtitle: 'Monitor AI System performance and governance metrics'
  });

  const updatePage = (title: string, subtitle?: string, section?: string) => {
    setPageData({ title, subtitle, section });
  };

  return (
    <PageContext.Provider value={{ pageData, setPageData, updatePage }}>
      {children}
    </PageContext.Provider>
  );
};
