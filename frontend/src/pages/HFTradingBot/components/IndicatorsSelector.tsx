import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface IndicatorsSelectorProps {
  selectedIndicators: string[];
  onIndicatorsChange: (indicators: string[]) => void;
}

const AVAILABLE_INDICATORS = [
  'VWAP',
  'CVD',
  'Order Blocks',
  'Liquidation Levels',
  'Open Interest',
  'RSI',
  'MACD'
];

export const IndicatorsSelector: React.FC<IndicatorsSelectorProps> = ({
  selectedIndicators,
  onIndicatorsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleIndicator = (indicator: string) => {
    if (selectedIndicators.includes(indicator)) {
      onIndicatorsChange(selectedIndicators.filter(i => i !== indicator));
    } else {
      onIndicatorsChange([...selectedIndicators, indicator]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1 bg-panel border rounded-xl text-sm font-bold transition-colors ${
          selectedIndicators.length > 0 
            ? 'border-blue-500 text-blue-500' 
            : 'border-panel text-secondary hover:text-primary hover:border-blue-500'
        }`}
      >
        Indicators {selectedIndicators.length > 0 && `(${selectedIndicators.length})`}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-panel border border-panel rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 py-1">
          {AVAILABLE_INDICATORS.map(indicator => {
            const isSelected = selectedIndicators.includes(indicator);
            return (
              <label 
                key={indicator}
                onClick={() => toggleIndicator(indicator)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--border-color)] cursor-pointer transition-colors"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-secondary'
                }`}>
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                  {indicator}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
