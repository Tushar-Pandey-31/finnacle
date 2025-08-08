import { useEffect, useRef, useState } from 'react';

export function usePolling(getter, { key, intervalMs = 5000, maxPoints = 300 } = {}) {
  const [points, setPoints] = useState([]);
  const [last, setLast] = useState(null);
  const timerRef = useRef(null);
  const keyRef = useRef(key);

  useEffect(() => { keyRef.current = key; }, [key]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const data = await getter(keyRef.current);
        if (cancelled || !data) return;
        const price = Number(data.price ?? data.rate ?? data.c ?? data.value);
        if (!isFinite(price)) return;
        setLast(data);
        setPoints((prev) => {
          const next = [...prev, { t: Date.now(), p: price }];
          const over = next.length - maxPoints;
          if (over > 0) next.splice(0, over);
          return next;
        });
      } catch {}
    }
    tick();
    timerRef.current = setInterval(tick, intervalMs);
    return () => { cancelled = true; if (timerRef.current) clearInterval(timerRef.current); };
  }, [getter, intervalMs, maxPoints]);

  return { points, last };
}