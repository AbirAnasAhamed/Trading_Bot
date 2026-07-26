import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface ChartContainerProps {
  historicalData: CandlestickData[];
  liveCandle: CandlestickData | null;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ historicalData, liveCandle }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

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

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update historical data
  useEffect(() => {
    if (seriesRef.current && historicalData.length > 0) {
      // Sort to ensure time is strictly ascending, lightweight-charts requires this
      const sorted = [...historicalData].sort((a, b) => (a.time as number) - (b.time as number));
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
  }, [historicalData]);

  // Update live candle
  useEffect(() => {
    if (seriesRef.current && liveCandle) {
      seriesRef.current.update(liveCandle);
    }
  }, [liveCandle]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[500px]" />;
};
