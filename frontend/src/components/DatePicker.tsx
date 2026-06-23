import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  max?: string;
}

export default function DatePicker({ value, onChange, max }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Adjust for timezone offset to get correct YYYY-MM-DD
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    const formattedDate = adjustedDate.toISOString().split('T')[0];
    
    if (max && formattedDate > max) return;
    
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    const d = new Date(dateString);
    // Add timezone offset correction for display
    const offset = d.getTimezoneOffset();
    const adjusted = new Date(d.getTime() + (offset*60*1000));
    return adjusted.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-');
    return day === parseInt(d) && 
           currentMonth.getMonth() === parseInt(m) - 1 && 
           currentMonth.getFullYear() === parseInt(y);
  };

  const isFuture = (day: number) => {
    if (!max) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0] > max;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-left"
      >
        <span className={value ? "text-slate-900 font-medium" : "text-slate-400"}>
          {formatDate(value)}
        </span>
        <CalendarIcon className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 w-72 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-semibold text-slate-800">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-slate-400">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="h-8" />
            ))}
            {days.map(day => {
              const selected = isSelected(day);
              const today = isToday(day);
              const disabled = isFuture(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDate(day)}
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all
                    ${disabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}
                    ${selected ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md shadow-blue-500/30 font-bold' : 'text-slate-700'}
                    ${today && !selected ? 'border-2 border-blue-100 text-blue-600 font-bold' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
