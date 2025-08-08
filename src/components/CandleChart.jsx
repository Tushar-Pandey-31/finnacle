import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

export default function CandleChart({ seriesData, height = 320 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

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
    const candleSeries = chart.addCandlestickSeries({ upColor: '#16a34a', downColor: '#ef4444', borderDownColor: '#ef4444', borderUpColor: '#16a34a', wickDownColor: '#ef4444', wickUpColor: '#16a34a' });
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;
    candleSeriesRef.current.setData(seriesData || []);
  }, [seriesData]);

  return (
    <div ref={containerRef} style={{ width: '100%', height }} />
  );
}