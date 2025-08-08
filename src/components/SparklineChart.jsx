import { useEffect, useRef } from 'react';

export default function SparklineChart({ points, height = 120, color = '#2563eb' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    if (!points || points.length < 2) return;

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
    const handle = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Re-render by nudging a ref; dependency on points will re-run
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // noop to trigger useEffect
      }
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return <canvas ref={canvasRef} />;
}