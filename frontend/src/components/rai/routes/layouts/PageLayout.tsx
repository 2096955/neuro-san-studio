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

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, className = '' }) => {
  return (
    <div className="min-h-full">
      {/* White Title Bar */}
      {title && (
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      
      {/* Grey Content Area */}
      <div 
        className={`px-6 pb-6 pt-3 ${className}`}
        style={{ 
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 180px)' // Account for header and title bar
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
