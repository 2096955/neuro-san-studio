import React from 'react';

export interface SlideOutDetailContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'half';
  position?: 'left' | 'right';
  showOverlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const SlideOutDetailContainer: React.FC<SlideOutDetailContainerProps> = ({
  isOpen,
  onClose,
  title = 'Details',
  width = 'lg',
  position = 'right',
  showOverlay = true,
  className = '',
  children
}) => {
  if (!isOpen) return null;

  const getWidthClass = () => {
    switch (width) {
      case 'sm': return 'w-80';
      case 'md': return 'w-96';
      case 'lg': return 'w-[32rem]';
      case 'xl': return 'w-[48rem]';
      case 'half': return 'w-1/2';
      default: return 'w-[32rem]';
    }
  };


  const getSlideClasses = () => {
    return position === 'left'
      ? isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'
      : isOpen ? 'transform translate-x-0' : 'transform translate-x-full';
  };

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out panel */}
      <div className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full ${getWidthClass()} z-50 transition-transform duration-300 ease-in-out ${getSlideClasses()} ${className}`}>
        <div className="h-full bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <div className="text-center py-8">
                <h1 className="text-2xl font-bold text-gray-800">Hello World</h1>
              </div>
              
              {/* Additional content area */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOutDetailContainer;
