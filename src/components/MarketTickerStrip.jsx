import { useEffect, useMemo, useState } from 'react';
import { getQuote } from '../services/finnhub';

const DEFAULT_ITEMS = [
  { key: 'QQQ', label: 'NASDAQ 100', symbol: 'QQQ' },
  { key: 'SPY', label: 'S&P 500', symbol: 'SPY' },
  { key: 'NIFTY', label: 'NIFTY 50' },
  { key: 'XAUUSD', label: 'XAUUSD' },
  { key: 'BTC', label: 'BTC' },
];

export default function MarketTickerStrip({ items = DEFAULT_ITEMS, refreshMs = 20000 }) {
  const [data, setData] = useState({}); // key -> { price, dp }

  const fetchable = useMemo(() => items.filter((i) => i.symbol), [items]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const results = await Promise.all(
          fetchable.map(async (i) => {
            try {
              const q = await getQuote(i.symbol);
              return [i.key, { price: q.c, dp: q.dp }];
            } catch {
              return [i.key, { price: null, dp: null }];
            }
          })
        );
        if (cancelled) return;
        setData((prev) => ({ ...prev, ...Object.fromEntries(results) }));
      } catch {
        // ignore
      }
    }
    load();
    const t = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(t); };
  }, [fetchable, refreshMs]);

  const displayItems = useMemo(() => items.map((i) => ({
    ...i,
    price: data[i.key]?.price ?? null,
    dp: data[i.key]?.dp ?? null,
  })), [items, data]);

  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...displayItems, ...displayItems].map((i, idx) => {
          const positive = (i.dp ?? 0) > 0;
          const negative = (i.dp ?? 0) < 0;
          const cls = positive ? 'pos' : negative ? 'neg' : 'flat';
          return (
            <div className={`ticker-item ${cls}`} key={`${i.key}-${idx}`}>
              <span className="sym">{i.label}</span>
              <span className="price">{i.price != null ? Number(i.price).toFixed(2) : '--'}</span>
              <span className="dp">{i.dp != null ? `${i.dp.toFixed(2)}%` : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}