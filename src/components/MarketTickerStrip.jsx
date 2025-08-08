import { useEffect, useMemo, useState } from 'react';
import { getQuote } from '../services/finnhub';
import { getCryptoQuote } from '../services/crypto';
import { getFxPair } from '../services/forex';

const DEFAULT_ITEMS = [
  { key: 'QQQ', label: 'NASDAQ 100', type: 'equity', symbol: 'QQQ' },
  { key: 'SPY', label: 'S&P 500', type: 'equity', symbol: 'SPY' },
  { key: 'EURUSD', label: 'EURUSD', type: 'fx', pair: 'EURUSD' },
  { key: 'USDJPY', label: 'USDJPY', type: 'fx', pair: 'USDJPY' },
  { key: 'BTC', label: 'BTC', type: 'crypto', symbol: 'BTC' },
  { key: 'ETH', label: 'ETH', type: 'crypto', symbol: 'ETH' },
];

export default function MarketTickerStrip({ items = DEFAULT_ITEMS, refreshMs = 20000 }) {
  const [data, setData] = useState({}); // key -> { price, dp }

  const fetchers = useMemo(() => items.map((i) => async () => {
    try {
      if (i.type === 'equity' && i.symbol) {
        const q = await getQuote(i.symbol);
        return [i.key, { price: q.c, dp: q.dp }];
      }
      if (i.type === 'crypto' && i.symbol) {
        const q = await getCryptoQuote(i.symbol);
        return [i.key, { price: q.price, dp: q.percentChange24h }];
      }
      if (i.type === 'fx' && i.pair) {
        const q = await getFxPair(i.pair);
        return [i.key, { price: q.rate, dp: null }];
      }
      return [i.key, { price: null, dp: null }];
    } catch {
      return [i.key, { price: null, dp: null }];
    }
  }), [items]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(fetchers.map((fn) => fn()));
      if (cancelled) return;
      setData((prev) => ({ ...prev, ...Object.fromEntries(results) }));
    }
    load();
    const t = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(t); };
  }, [fetchers, refreshMs]);

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
              <span className="price">{i.price != null ? Number(i.price).toFixed(4) : '--'}</span>
              <span className="dp">{i.dp != null ? `${Number(i.dp).toFixed(2)}%` : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}