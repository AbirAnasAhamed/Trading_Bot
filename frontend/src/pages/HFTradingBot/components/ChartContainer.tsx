import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, IPriceLine } from 'lightweight-charts';

interface ChartContainerProps {
  historicalData: CandlestickData[];
  liveCandle: CandlestickData | null;
  orderbookData?: { bids: number[][]; asks: number[][] };
  wallThreshold?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  historicalData, 
  liveCandle, 
  orderbookData,
  wallThreshold = 500
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  // References for wall price lines to update them efficiently
  const buyWallLineRef = useRef<IPriceLine | null>(null);
  const sellWallLineRef = useRef<IPriceLine | null>(null);

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

  // Handle Orderbook Buy/Sell Walls overlay
  useEffect(() => {
    if (!seriesRef.current || !orderbookData) return;
    
    const { bids, asks } = orderbookData;
    
    // Find Buy Wall (max volume in bids)
    let maxBidVolume = 0;
    let buyWallPrice = 0;
    bids.forEach(([price, vol]) => {
      if (vol > maxBidVolume) {
        maxBidVolume = vol;
        buyWallPrice = price;
      }
    });

    // Find Sell Wall (max volume in asks)
    let maxAskVolume = 0;
    let sellWallPrice = 0;
    asks.forEach(([price, vol]) => {
      if (vol > maxAskVolume) {
        maxAskVolume = vol;
        sellWallPrice = price;
      }
    });

    // Handle Buy Wall Line
    if (maxBidVolume >= wallThreshold && buyWallPrice > 0) {
      const buyOptions = {
        price: buyWallPrice,
        color: '#22c55e',
        lineWidth: 2 as const,
        lineStyle: 0 as const, // Solid line
        axisLabelVisible: true,
        title: `Buy Wall (${maxBidVolume > 1000 ? (maxBidVolume/1000).toFixed(1) + 'k' : maxBidVolume.toFixed(2)})`,
      };

      if (!buyWallLineRef.current) {
        buyWallLineRef.current = seriesRef.current.createPriceLine(buyOptions);
      } else {
        buyWallLineRef.current.applyOptions(buyOptions);
      }
    } else if (buyWallLineRef.current) {
      seriesRef.current.removePriceLine(buyWallLineRef.current);
      buyWallLineRef.current = null;
    }

    // Handle Sell Wall Line
    if (maxAskVolume >= wallThreshold && sellWallPrice > 0) {
      const sellOptions = {
        price: sellWallPrice,
        color: '#ef4444',
        lineWidth: 2 as const,
        lineStyle: 0 as const, // Solid line
        axisLabelVisible: true,
        title: `Sell Wall (${maxAskVolume > 1000 ? (maxAskVolume/1000).toFixed(1) + 'k' : maxAskVolume.toFixed(2)})`,
      };

      if (!sellWallLineRef.current) {
        sellWallLineRef.current = seriesRef.current.createPriceLine(sellOptions);
      } else {
        sellWallLineRef.current.applyOptions(sellOptions);
      }
    } else if (sellWallLineRef.current) {
      seriesRef.current.removePriceLine(sellWallLineRef.current);
      sellWallLineRef.current = null;
    }
  }, [orderbookData, wallThreshold]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[500px]" />;
};
