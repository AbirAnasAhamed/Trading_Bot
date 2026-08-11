import { useEffect, useRef } from 'react';
import { LineSeries, HistogramSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, HistogramData, IPriceLine } from 'lightweight-charts';

interface UseChartIndicatorsProps {
  chart: IChartApi | null;
  indicatorsData: any;
  mainSeries?: ISeriesApi<"Candlestick"> | null;
}

export const useChartIndicators = ({ chart, indicatorsData, mainSeries }: UseChartIndicatorsProps) => {
  const vwapSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const macdSigRef = useRef<ISeriesApi<"Line"> | null>(null);
  const cvdSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const oiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const liquidationLinesRef = useRef<IPriceLine[]>([]);
  const orderBlockLinesRef = useRef<IPriceLine[]>([]);

  useEffect(() => {
    if (!chart) return;

    // Handle VWAP
    if (indicatorsData['VWAP'] && indicatorsData['VWAP'].length > 0) {
      if (!vwapSeriesRef.current) {
        vwapSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#eab308', // yellow-500
          lineWidth: 1,
          title: 'VWAP',
          priceScaleId: 'right', // same as main price scale
        });
      }
      
      const vwapData = indicatorsData['VWAP'];
      if (Array.isArray(vwapData)) {
        const sorted = [...vwapData].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) {
            vwapSeriesRef.current.setData(sorted);
        } else if (sorted.length === 1) {
            try { vwapSeriesRef.current.update(sorted[0]); } catch(e) {}
        }
      }
    } else if (vwapSeriesRef.current) {
        chart.removeSeries(vwapSeriesRef.current);
        vwapSeriesRef.current = null;
    }

    // Handle RSI
    if (indicatorsData['RSI'] && indicatorsData['RSI'].length > 0) {
      if (!rsiSeriesRef.current) {
        rsiSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#a855f7', // purple-500
          lineWidth: 2,
          title: 'RSI',
          priceScaleId: 'rsi_scale',
          priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        });
        chart.priceScale('rsi_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      }
      const rsiData = indicatorsData['RSI'];
      if (Array.isArray(rsiData)) {
        const sorted = [...rsiData].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) rsiSeriesRef.current.setData(sorted);
        else if (sorted.length === 1) try { rsiSeriesRef.current.update(sorted[0]); } catch(e) {}
      }
    } else if (rsiSeriesRef.current) {
        chart.removeSeries(rsiSeriesRef.current);
        rsiSeriesRef.current = null;
    }

    // Handle MACD
    if (indicatorsData['MACD']) {
      if (!macdSeriesRef.current) {
        macdSeriesRef.current = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, title: 'MACD', priceScaleId: 'macd_scale' });
        macdSigRef.current = chart.addSeries(LineSeries, { color: '#f97316', lineWidth: 2, title: 'Signal', priceScaleId: 'macd_scale' });
        macdHistRef.current = chart.addSeries(HistogramSeries, { priceScaleId: 'macd_scale', title: 'Hist' });
        chart.priceScale('macd_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      }
      const md = indicatorsData['MACD'];
      if (md.macd && md.macd.length > 0) {
        const sorted = [...md.macd].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) macdSeriesRef.current?.setData(sorted);
        else if (sorted.length === 1) try { macdSeriesRef.current?.update(sorted[0]); } catch(e) {}
      }
      if (md.signal && md.signal.length > 0) {
        const sorted = [...md.signal].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) macdSigRef.current?.setData(sorted);
        else if (sorted.length === 1) try { macdSigRef.current?.update(sorted[0]); } catch(e) {}
      }
      if (md.histogram && md.histogram.length > 0) {
        const sorted = [...md.histogram].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) macdHistRef.current?.setData(sorted);
        else if (sorted.length === 1) try { macdHistRef.current?.update(sorted[0] as HistogramData); } catch(e) {}
      }
    } else if (macdSeriesRef.current) {
        chart.removeSeries(macdSeriesRef.current);
        if (macdSigRef.current) chart.removeSeries(macdSigRef.current);
        if (macdHistRef.current) chart.removeSeries(macdHistRef.current);
        macdSeriesRef.current = null;
        macdSigRef.current = null;
        macdHistRef.current = null;
    }

    // Handle CVD
    if (indicatorsData['CVD'] && indicatorsData['CVD'].length > 0) {
      if (!cvdSeriesRef.current) {
        cvdSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#06b6d4', // cyan-500
          lineWidth: 2,
          title: 'CVD',
          priceScaleId: 'cvd_scale',
        });
        chart.priceScale('cvd_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      }
      const cvdData = indicatorsData['CVD'];
      if (Array.isArray(cvdData)) {
        const sorted = [...cvdData].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) cvdSeriesRef.current.setData(sorted);
        else if (sorted.length === 1) try { cvdSeriesRef.current.update(sorted[0]); } catch(e) {}
      }
    } else if (cvdSeriesRef.current) {
        chart.removeSeries(cvdSeriesRef.current);
        cvdSeriesRef.current = null;
    }

    // Handle Open Interest
    if (indicatorsData['Open Interest'] && indicatorsData['Open Interest'].length > 0) {
      if (!oiSeriesRef.current) {
        oiSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#10b981', // emerald-500
          lineWidth: 2,
          title: 'Open Interest',
          priceScaleId: 'oi_scale',
        });
        chart.priceScale('oi_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      }
      const oiData = indicatorsData['Open Interest'];
      if (Array.isArray(oiData)) {
        const sorted = [...oiData].sort((a, b) => (a.time as number) - (b.time as number));
        if (sorted.length > 1) oiSeriesRef.current.setData(sorted);
        else if (sorted.length === 1) try { oiSeriesRef.current.update(sorted[0]); } catch(e) {}
      }
    } else if (oiSeriesRef.current) {
        chart.removeSeries(oiSeriesRef.current);
        oiSeriesRef.current = null;
    }

    // Handle Order Blocks (Markers on Main Series) & Liquidation Levels (Price Lines)
    if (mainSeries) {
      // Order Blocks
      orderBlockLinesRef.current.forEach(line => {
        try { mainSeries.removePriceLine(line); } catch(e) {}
      });
      orderBlockLinesRef.current = [];

      if (indicatorsData['Order Blocks'] && indicatorsData['Order Blocks'].length > 0) {
        const obs = indicatorsData['Order Blocks'];
        obs.forEach((ob: any) => {
          if (ob.top && ob.bottom) {
             const color = ob.type === 'bullish' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
             const topLine = mainSeries.createPriceLine({
               price: ob.top,
               color: color,
               lineWidth: 1,
               lineStyle: 2, // Dashed
               title: `OB (${ob.type})`,
               axisLabelVisible: false,
             });
             const bottomLine = mainSeries.createPriceLine({
               price: ob.bottom,
               color: color,
               lineWidth: 1,
               lineStyle: 2,
               title: '',
               axisLabelVisible: false,
             });
             orderBlockLinesRef.current.push(topLine, bottomLine);
          }
        });
      }

      // Liquidation Levels
      liquidationLinesRef.current.forEach(line => mainSeries.removePriceLine(line));
      liquidationLinesRef.current = [];
      
      if (indicatorsData['Liquidation Levels'] && indicatorsData['Liquidation Levels'].length > 0) {
        const levels = indicatorsData['Liquidation Levels'];
        levels.forEach((level: any) => {
          const line = mainSeries.createPriceLine({
            price: level.price,
            color: level.type === 'long' ? '#ef4444' : '#22c55e', // Long liquidation = red line (sell pressure), Short = green line
            lineWidth: 1,
            lineStyle: 1, // Dotted
            title: `Liq (${level.type === 'long' ? 'L' : 'S'})`,
            axisLabelVisible: true,
          });
          liquidationLinesRef.current.push(line);
        });
      }
    }

  }, [chart, indicatorsData, mainSeries]);
};
