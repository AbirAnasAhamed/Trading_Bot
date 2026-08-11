import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, IPriceLine } from 'lightweight-charts';
import { useChartIndicators } from '../hooks/useChartIndicators';

interface ChartContainerProps {
  historicalData: CandlestickData[];
  liveCandle: CandlestickData | null;
  orderbookData?: { bids: number[][]; asks: number[][] };
  wallThreshold?: number;
  volumeType?: 'base' | 'quote';
  indicatorsData?: any;
}

// Utility to format large volumes nicely
const formatVolume = (vol: number) => {
  if (vol >= 1000000) {
    return (vol / 1000000).toFixed(1) + 'M';
  }
  if (vol >= 1000) {
    return (vol / 1000).toFixed(1) + 'k';
  }
  return vol.toFixed(2);
};

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  historicalData, 
  liveCandle, 
  orderbookData,
  wallThreshold = 500,
  volumeType = 'base',
  indicatorsData = {}
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = React.useState<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  // Reference map for all active wall price lines to update/remove them efficiently
  const wallLinesRef = useRef<Map<number, IPriceLine>>(new Map());

  // Handle Indicators rendering
  useChartIndicators({ chart: chartInstance, indicatorsData, mainSeries: seriesRef.current });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#A0AEC0', // var(--text-secondary)
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal crosshair
      }
    });

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    setChartInstance(chart);
    seriesRef.current = candlestickSeries;

    // Handle resize using ResizeObserver for dynamic layout changes
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ 
        width: newRect.width,
        height: newRect.height
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update historical data
  useEffect(() => {
    if (seriesRef.current && historicalData.length > 0) {
      // Sort to ensure time is strictly ascending, lightweight-charts requires this
      const sorted = [...historicalData].sort((a, b) => (a.time as number) - (b.time as number));
      
      // Prevent chart blinking when indicators change by checking if data is actually new
      const existingData = seriesRef.current.data();
      const isNewData = existingData.length === 0 || 
                        existingData[0].time !== sorted[0].time || 
                        (existingData[0] as CandlestickData).close !== sorted[0].close;

      if (isNewData) {
        seriesRef.current.setData(sorted);

        // Dynamic precision based on first candle's close price
        const firstClose = sorted[0].close;
        let precision = 2;
        let minMove = 0.01;
        
        if (firstClose < 0.000001) {
          precision = 10;
          minMove = 0.0000000001;
        } else if (firstClose < 0.0001) {
          precision = 8;
          minMove = 0.00000001;
        } else if (firstClose < 1) {
          precision = 6;
          minMove = 0.000001;
        } else if (firstClose < 10) {
          precision = 4;
          minMove = 0.0001;
        }

        seriesRef.current.applyOptions({
          priceFormat: {
            type: 'price',
            precision: precision,
            minMove: minMove,
          }
        });
      }
    }
  }, [historicalData]);

  // Update live candle
  useEffect(() => {
    if (seriesRef.current && liveCandle) {
      seriesRef.current.update(liveCandle);
    }
  }, [liveCandle]);

  // Handle Orderbook Buy/Sell Walls overlay
  useEffect(() => {
    if (!seriesRef.current || !orderbookData) return;
    
    const { bids, asks } = orderbookData;
    const activeWallPrices = new Set<number>();
    
    // Process Bids (Buy Walls)
    bids.forEach(([price, vol]) => {
      const calculatedVolume = volumeType === 'quote' ? vol * price : vol;
      if (calculatedVolume >= wallThreshold && price > 0) {
        activeWallPrices.add(price);
        
        const buyOptions = {
          price: price,
          color: '#22c55e',
          lineWidth: 1 as const,
          lineStyle: 0 as const, // Solid line
          axisLabelVisible: true,
          title: `Buy Wall (${formatVolume(calculatedVolume)})`,
        };

        if (wallLinesRef.current.has(price)) {
          // Update existing line
          wallLinesRef.current.get(price)?.applyOptions(buyOptions);
        } else {
          // Create new line
          const line = seriesRef.current!.createPriceLine(buyOptions);
          wallLinesRef.current.set(price, line);
        }
      }
    });

    // Process Asks (Sell Walls)
    asks.forEach(([price, vol]) => {
      const calculatedVolume = volumeType === 'quote' ? vol * price : vol;
      if (calculatedVolume >= wallThreshold && price > 0) {
        activeWallPrices.add(price);
        
        const sellOptions = {
          price: price,
          color: '#ef4444',
          lineWidth: 1 as const,
          lineStyle: 0 as const, // Solid line
          axisLabelVisible: true,
          title: `Sell Wall (${formatVolume(calculatedVolume)})`,
        };

        if (wallLinesRef.current.has(price)) {
          // Update existing line
          wallLinesRef.current.get(price)?.applyOptions(sellOptions);
        } else {
          // Create new line
          const line = seriesRef.current!.createPriceLine(sellOptions);
          wallLinesRef.current.set(price, line);
        }
      }
    });

    // Cleanup lines that no longer meet the threshold
    for (const [price, line] of wallLinesRef.current.entries()) {
      if (!activeWallPrices.has(price)) {
        seriesRef.current.removePriceLine(line);
        wallLinesRef.current.delete(price);
      }
    }
  }, [orderbookData, wallThreshold, volumeType]);

  const errorMessages = Object.entries(indicatorsData || {})
    .filter(([k, v]) => k.endsWith('_error') && v)
    .map(([, v]) => v as string);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="absolute inset-0" />
      {errorMessages.length > 0 && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          {errorMessages.map((msg, idx) => (
            <div key={idx} className="bg-red-500/80 backdrop-blur text-white px-3 py-1.5 rounded text-sm shadow-md">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
