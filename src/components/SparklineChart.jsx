import { useEffect, useRef, useCallback } from 'react';

export default function SparklineChart({ points, height = 120, color = '#2563eb' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const dpr = window.devicePixelRatio || 1;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || container.clientWidth || 600;
    
    // Set canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    
    if (!points || points.length < 2) {
      // Draw placeholder when no data
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', width / 2, height / 2);
      return;
    }

    const xs = points.map((p) => p.t);
    const ys = points.map((p) => p.p);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const pad = 6;

    const xScale = (t) => {
      if (maxX === minX) return pad;
      return pad + ((t - minX) / (maxX - minX)) * (width - pad * 2);
    };
    const yScale = (p) => {
      const range = (maxY - minY) || 1;
      const y = height - pad - ((p - minY) / range) * (height - pad * 2);
      return y;
    };

    // Fill area
    ctx.beginPath();
    ctx.moveTo(xScale(points[0].t), yScale(points[0].p));
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(xScale(points[i].t), yScale(points[i].p));
    }
    ctx.lineTo(xScale(points[points.length - 1].t), height - pad);
    ctx.lineTo(xScale(points[0].t), height - pad);
    ctx.closePath();
    ctx.fillStyle = color + '22';
    ctx.fill();

    // Stroke line
    ctx.beginPath();
    ctx.moveTo(xScale(points[0].t), yScale(points[0].p));
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(xScale(points[i].t), yScale(points[i].p));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [points, height, color]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure container has updated dimensions
      setTimeout(drawChart, 10);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  // Use ResizeObserver if available for better container resize detection
  useEffect(() => {
    if (!window.ResizeObserver) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [drawChart]);

  return (
    <div ref={containerRef} className="chart-container" style={{ height: height + 'px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}