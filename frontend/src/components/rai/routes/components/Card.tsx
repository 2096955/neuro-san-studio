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

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  value?: string | number;
  subtitle?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title,
  icon,
  value,
  subtitle,
  onClick 
}) => {
  const baseClasses = `
    bg-white 
    rounded-xl 
    shadow-sm 
    border-0
    p-5
    transition-all 
    duration-200 
    hover:shadow-lg
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const CardContent = () => (
    <>
      {(title || icon || value) ? (
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-lg" 
                 style={{ backgroundColor: '#f8fafc' }}>
              <span className="text-2xl">{icon}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-medium text-gray-500 mb-1 tracking-tight">
                {title}
              </p>
            )}
            {value && (
              <div className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
                {value}
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ) : null}
      {children && (
        <div className={title || icon || value ? 'mt-4' : ''}>
          {children}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      <CardContent />
    </div>
  );
};

export default Card;
