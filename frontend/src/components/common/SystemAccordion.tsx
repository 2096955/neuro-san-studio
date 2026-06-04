import React, { useState, useEffect } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
  icon?: React.ReactNode;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface SystemAccordionProps {
  items: AccordionItem[];
  defaultOpenItems?: string[];
  allowMultiple?: boolean;
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  onItemSelect?: (item: AccordionItem) => void;
  selectedItemId?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'bordered';
  searchable?: boolean;
  searchPlaceholder?: string;
}

const SystemAccordion: React.FC<SystemAccordionProps> = ({
  items,
  defaultOpenItems = [],
  allowMultiple = true,
  onItemToggle,
  onItemSelect,
  selectedItemId,
  className = '',
  variant = 'default',
  searchable = false,
  searchPlaceholder = 'Search systems...'
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpenItems));
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize default open items
  useEffect(() => {
    setOpenItems(new Set(defaultOpenItems));
  }, [defaultOpenItems]);

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
      onItemToggle?.(itemId, false);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
      onItemToggle?.(itemId, true);
    }
    
    setOpenItems(newOpenItems);
  };

  const handleItemSelect = (item: AccordionItem) => {
    if (item.disabled) return;
    onItemSelect?.(item);
  };

  // Filter items based on search term
  const filteredItems = searchable
    ? items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const getBadgeStyles = (variant: string) => {
    const baseStyles = 'px-2 py-1 text-xs font-medium rounded-full';
    const variants = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return `${baseStyles} ${variants[variant as keyof typeof variants] || variants.default}`;
  };

  const getVariantStyles = () => {
    const variants = {
      default: 'space-y-2',
      compact: 'space-y-1',
      bordered: 'space-y-2 border border-gray-200 rounded-lg p-4'
    };
    return variants[variant];
  };

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && searchable && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <p>No systems found matching "{searchTerm}"</p>
        </div>
      )}

      {filteredItems.map((item) => {
        const isOpen = openItems.has(item.id);
        const isSelected = selectedItemId === item.id;

        return (
          <div
            key={item.id}
            className={`
              border border-gray-200 rounded-lg overflow-hidden transition-all duration-200
              ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
              ${item.disabled ? 'opacity-50' : ''}
            `}
          >
            {/* Header */}
            <div
              className={`
                px-4 py-3 cursor-pointer select-none transition-colors duration-200
                ${isSelected 
                  ? 'bg-blue-50 hover:bg-blue-100' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }
                ${item.disabled ? 'cursor-not-allowed' : ''}
              `}
              onClick={() => {
                if (!item.disabled) {
                  handleItemSelect(item);
                  toggleItem(item.id);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {item.icon && (
                    <div className="flex-shrink-0 text-gray-600">
                      {item.icon}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`
                        text-sm font-medium truncate
                        ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                      `}>
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className={getBadgeStyles(item.badge.variant)}>
                          {item.badge.text}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className={`
                        text-sm truncate mt-1
                        ${isSelected ? 'text-blue-700' : 'text-gray-600'}
                      `}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-2 p-1">
                  <svg
                    className={`
                      h-5 w-5 transition-transform duration-200
                      ${isOpen ? 'rotate-180' : ''}
                      ${isSelected ? 'text-blue-600' : 'text-gray-500'}
                    `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="px-4 py-3 bg-white border-t border-gray-200">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SystemAccordion;
