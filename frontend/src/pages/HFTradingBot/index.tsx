import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SingleChartWidget } from './components/SingleChartWidget';
import { Plus } from 'lucide-react';

export const HFTradingBot: React.FC = () => {
  const [charts, setCharts] = useState<{ id: string }[]>([{ id: '1' }]);
  const [topbarElement, setTopbarElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTopbarElement(document.getElementById('topbar-ws-indicator'));
  }, []);

  const addChart = () => {
    if (charts.length < 4) {
      setCharts([...charts, { id: Math.random().toString(36).substring(7) }]);
    }
  };

  const removeChart = (id: string) => {
    setCharts(charts.filter(chart => chart.id !== id));
  };

  const getGridClass = () => {
    switch (charts.length) {
      case 1:
        return 'grid-cols-1 grid-rows-1';
      case 2:
        return 'grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1';
      case 3:
      case 4:
        return 'grid-cols-1 grid-rows-4 lg:grid-cols-2 lg:grid-rows-2';
      default:
        return 'grid-cols-1 grid-rows-1';
    }
  };

  const topbarContent = (
    <div className="flex items-center">
      <button
        onClick={addChart}
        disabled={charts.length >= 4}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
          charts.length >= 4 
            ? 'bg-panel text-gray-500 cursor-not-allowed border border-panel' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
        }`}
      >
        <Plus size={16} />
        <span>Add Chart ({charts.length}/4)</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative p-2 bg-background">
      {topbarElement && createPortal(topbarContent, topbarElement)}

      <div className={`grid gap-2 flex-1 min-h-0 overflow-y-auto ${getGridClass()}`}>
        {charts.map(chart => (
          <div key={chart.id} className="min-h-[400px] lg:min-h-0 lg:h-full w-full">
            <SingleChartWidget 
              id={chart.id} 
              onClose={charts.length > 1 ? removeChart : undefined} 
              showClose={charts.length > 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
