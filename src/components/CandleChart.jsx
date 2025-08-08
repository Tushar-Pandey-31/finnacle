import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

export default function CandleChart({ seriesData, height = 320 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const initialWidth = container.clientWidth || window.innerWidth || 600;
    const chart = createChart(container, {
      height,
      width: initialWidth,
      layout: { background: { color: '#fff' }, textColor: '#333' },
      grid: { horzLines: { color: '#f0f3fa' }, vertLines: { color: '#f0f3fa' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });
    chartRef.current = chart;
    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth || 600;
      chart.applyOptions({ width: w });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (!Array.isArray(seriesData) || seriesData.length === 0) return;

    if (!seriesRef.current) {
      seriesRef.current = chart.addCandlestickSeries({ upColor: '#16a34a', downColor: '#ef4444', borderDownColor: '#ef4444', borderUpColor: '#16a34a', wickDownColor: '#ef4444', wickUpColor: '#16a34a' });
    }
    seriesRef.current.setData(seriesData);
  }, [seriesData]);

  if (!Array.isArray(seriesData) || seriesData.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height }} />
  );
}