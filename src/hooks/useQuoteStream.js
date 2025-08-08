import { useEffect, useRef, useState } from 'react';
import { getQuote } from '../services/finnhub';

export function useQuoteStream(symbol, { intervalMs = 5000, maxPoints = 300 } = {}) {
  const [points, setPoints] = useState([]); // { t, p }
  const [last, setLast] = useState(null); // latest quote
  const timerRef = useRef(null);
  const symRef = useRef(symbol);

  useEffect(() => {
    symRef.current = symbol;
  }, [symbol]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const q = await getQuote(symRef.current);
        if (cancelled || !q) return;
        const price = Number(q.c);
        if (!isFinite(price)) return;
        setLast(q);
        setPoints((prev) => {
          const next = [...prev, { t: Date.now(), p: price }];
          const over = next.length - maxPoints;
          if (over > 0) next.splice(0, over);
          return next;
        });
      } catch {
        // ignore
      }
    }
    tick();
    timerRef.current = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs, maxPoints]);

  return { points, last };
}