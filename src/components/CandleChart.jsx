import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

export default function CandleChart({ seriesData, linePoints = [], height = 320 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef({ type: null, api: null });

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      height,
      layout: { background: { color: '#fff' }, textColor: '#333' },
      grid: { horzLines: { color: '#f0f3fa' }, vertLines: { color: '#f0f3fa' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });
    chartRef.current = chart;
    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = { type: null, api: null };
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const hasCandles = Array.isArray(seriesData) && seriesData.length > 0;
    const hasLine = Array.isArray(linePoints) && linePoints.length > 1;

    const current = seriesRef.current;
    const needsCandle = hasCandles && current.type !== 'candle';
    const needsLine = !hasCandles && hasLine && current.type !== 'line';

    if (needsCandle || needsLine) {
      if (current.api) {
        chart.removeSeries(current.api);
      }
      if (hasCandles) {
        const candle = chart.addCandlestickSeries({ upColor: '#16a34a', downColor: '#ef4444', borderDownColor: '#ef4444', borderUpColor: '#16a34a', wickDownColor: '#ef4444', wickUpColor: '#16a34a' });
        seriesRef.current = { type: 'candle', api: candle };
      } else if (hasLine) {
        const area = chart.addAreaSeries({ lineColor: '#2563eb', topColor: 'rgba(37,99,235,0.3)', bottomColor: 'rgba(37,99,235,0.0)' });
        seriesRef.current = { type: 'line', api: area };
      }
    }

    if (seriesRef.current.api) {
      if (hasCandles) {
        seriesRef.current.api.setData(seriesData);
      } else if (hasLine) {
        // convert ms -> seconds for lightweight-charts time
        const lineData = linePoints.map((p) => ({ time: Math.floor(p.t / 1000), value: Number(p.p) || 0 }));
        seriesRef.current.api.setData(lineData);
      }
    }
  }, [seriesData, linePoints]);

  return (
    <div ref={containerRef} style={{ width: '100%', height }} />
  );
}