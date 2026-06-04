import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  isActive?: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FiltersProps {
  /** Array of filter options to display as buttons */
  options: FilterOption[];
  /** Currently selected filter value */
  selectedValue: string;
  /** Callback when a filter is selected */
  onFilterChange?: (value: string) => void;
  /** Whether to show the date picker dropdown */
  showDatePicker?: boolean;
  /** Callback when date range is selected */
  onDateRangeChange?: (dateRange: DateRange) => void;
  /** Custom className for styling */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const Filters: React.FC<FiltersProps> = ({
  options = [],
  selectedValue,
  onFilterChange,
  showDatePicker = true,
  onDateRangeChange,
  className = '',
  size = 'md'
}) => {
  const [selected, setSelected] = useState(selectedValue);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: new Date(2022, 9, 10, 14, 19), // Oct 10, 2022 14:19
    endDate: new Date(2025, 9, 9, 14, 19)     // Oct 9, 2025 14:19
  });
  const [selectingStart, setSelectingStart] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleFilterClick = (value: string) => {
    setSelected(value);
    setShowCalendar(false);
    onFilterChange?.(value);
  };

  const handleDatePickerClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateClick = (date: Date) => {
    if (selectingStart) {
      setSelectedRange({ ...selectedRange, startDate: date });
      setSelectingStart(false);
    } else {
      setSelectedRange({ ...selectedRange, endDate: date });
      setSelectingStart(true);
      onDateRangeChange?.({
        startDate: selectedRange.startDate,
        endDate: date
      });
      setShowCalendar(false);
    }
  };

  const formatDateRange = () => {
    const start = selectedRange.startDate;
    const end = selectedRange.endDate;
    const formatDate = (date: Date) => {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      const time = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      return `${month} ${day}, ${year} ${time}`;
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date) => {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date.getDate());
    return currentDate >= selectedRange.startDate && currentDate <= selectedRange.endDate;
  };

  const isDateSelected = (date: Date) => {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date.getDate());
    return currentDate.toDateString() === selectedRange.startDate.toDateString() ||
           currentDate.toDateString() === selectedRange.endDate.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getContainerPadding = () => {
    switch (size) {
      case 'sm':
        return 'p-0.5';
      case 'lg':
        return 'p-1.5';
      default:
        return 'p-1';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Filter Buttons Container */}
      <div className={`flex items-center bg-gray-100 rounded-lg ${getContainerPadding()}`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterClick(option.value)}
            className={`
              ${getSizeClasses()}
              font-medium rounded-md transition-all duration-200
              ${
                selected === option.value
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Date Picker Button */}
      {showDatePicker && (
        <div className="relative" ref={calendarRef}>
          <button
            onClick={handleDatePickerClick}
            className={`
              ${getSizeClasses()}
              flex items-center gap-2 bg-white hover:bg-gray-50 
              text-gray-700 rounded-lg border border-blue-200
              transition-all duration-200 min-w-[280px] justify-between
            `}
          >
            <span className="text-sm font-medium text-blue-600">
              {formatDateRange()}
            </span>
            <Calendar size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="text-blue-600" />
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-80">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="text-lg font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-8"></div>
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, index) => {
                  const day = index + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isInRange = isDateInRange(date);
                  const isSelected = isDateSelected(date);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(date)}
                      className={`
                        h-8 w-8 text-sm rounded hover:bg-blue-100 transition-colors
                        ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : isInRange
                            ? 'bg-blue-100 text-blue-800'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time Selection */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="font-medium">14</span>
                  <span>:</span>
                  <span className="font-medium">19</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;
