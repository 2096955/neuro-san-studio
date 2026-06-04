import React, { useState, useEffect } from 'react';
import SystemAccordion, { type AccordionItem } from './SystemAccordion';

// Add breathing animation styles
const breathingStyles = `
  @keyframes breathe {
    0%, 100% { 
      opacity: 0.8;
      transform: scale(1);
    }
    50% { 
      opacity: 1;
      transform: scale(1.15);
    }
  }
`;

export interface SlideOutContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  accordionItems?: AccordionItem[];
  defaultOpenItems?: string[];
  onItemSelect?: (item: AccordionItem) => void;
  selectedItemId?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'half';
  position?: 'left' | 'right';
  showOverlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const SlideOutContainer: React.FC<SlideOutContainerProps> = ({
  isOpen,
  onClose,
  title,
  accordionItems,
  defaultOpenItems = [],
  onItemSelect,
  selectedItemId,
  width = 'lg',
  position = 'right',
  showOverlay = true,
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getWidthClass = () => {
    const widths = {
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[32rem]',
      xl: 'w-[88rem]',
      half: 'w-1/2'
    };
    return widths[width];
  };

  const getPositionClasses = () => {
    if (position === 'left') {
      return {
        container: 'left-0',
        transform: isOpen ? 'translate-x-0' : '-translate-x-full'
      };
    }
    return {
      container: 'right-0',
      transform: isOpen ? 'translate-x-0' : 'translate-x-full'
    };
  };

  const positionClasses = getPositionClasses();

  if (!isVisible) return null;

  return (
    <>
      {/* Inject breathing animation styles */}
      <style>{breathingStyles}</style>
      
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`
            fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`
          fixed top-0 ${positionClasses.container} h-full z-50
          ${getWidthClass()}
          transform transition-transform duration-300 ease-in-out
          ${positionClasses.transform}
          ${className}
        `}
      >
        {/* Animated Arrow on Left Edge - Seamlessly Integrated */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full z-10">
          <button
            onClick={onClose}
            className="hover:bg-gray-50 shadow-xl p-3 transition-all duration-200 group border border-gray-200 border-r-0"
            style={{
              background: 'linear-gradient(to right, #ffffff, #f8fafc)',
              borderTopLeftRadius: '0.5rem',
              borderBottomLeftRadius: '0.5rem',
              borderTopRightRadius: '0',
              borderBottomRightRadius: '0'
            }}
          >
            <svg 
              className="h-6 w-6 text-purple-500 group-hover:text-purple-400 transition-colors duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                animation: 'breathe 1.5s ease-in-out infinite'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="h-full bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4">
              {accordionItems && (
                <SystemAccordion
                  items={accordionItems}
                  defaultOpenItems={defaultOpenItems}
                  onItemSelect={onItemSelect}
                  selectedItemId={selectedItemId}
                  allowMultiple={true}
                  searchable={true}
                  searchPlaceholder="Search AI systems..."
                  variant="default"
                />
              )}
              
              {/* Additional content area */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOutContainer;
