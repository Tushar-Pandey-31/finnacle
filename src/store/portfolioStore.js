import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

function computeAveragePrice(currentAvg, currentQty, tradeQty, tradePrice) {
  const totalCost = currentAvg * currentQty + tradePrice * tradeQty;
  const totalQty = currentQty + tradeQty;
  return totalQty === 0 ? 0 : totalCost / totalQty;
}

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      cash: 10000, // temporary client-only default; backend is source of truth
      positions: {}, // key -> { id, symbol, type: 'stock'|'option', quantity, avgPrice, meta }
      orders: [], // { id, side, symbol, type, quantity, price, timestamp }
      realizedPnl: 0,

      reset() {
        set({ cash: 10000, positions: {}, orders: [], realizedPnl: 0 });
      },

      buy({ id, symbol, type, quantity, price, meta }) {
        const state = get();
        const cost = quantity * price;
        const nextCash = state.cash - cost;
        const existing = state.positions[id] || { id, symbol, type, quantity: 0, avgPrice: 0, meta };
        const nextQty = existing.quantity + quantity;
        const nextAvg = computeAveragePrice(existing.avgPrice, existing.quantity, quantity, price);
        const nextPositions = {
          ...state.positions,
          [id]: { ...existing, quantity: nextQty, avgPrice: nextAvg, meta: { ...existing.meta, ...meta } },
        };
        set({
          cash: nextCash,
          positions: nextPositions,
          orders: [
            ...state.orders,
            { id: crypto.randomUUID(), side: 'buy', symbol, type, quantity, price, timestamp: Date.now(), meta },
          ],
        });
      },

      sell({ id, symbol, type, quantity, price }) {
        const state = get();
        const existing = state.positions[id];
        if (!existing || existing.quantity < quantity) {
          throw new Error('Insufficient quantity to sell');
        }
        const proceeds = quantity * price;
        const nextCash = state.cash + proceeds;
        const remainingQty = existing.quantity - quantity;
        const realized = (price - existing.avgPrice) * quantity;
        const nextPositions = { ...state.positions };
        if (remainingQty === 0) {
          delete nextPositions[id];
        } else {
          nextPositions[id] = { ...existing, quantity: remainingQty };
        }
        set({
          cash: nextCash,
          positions: nextPositions,
          realizedPnl: state.realizedPnl + realized,
          orders: [
            ...state.orders,
            { id: crypto.randomUUID(), side: 'sell', symbol, type, quantity, price, timestamp: Date.now() },
          ],
        });
      },
    }),
    {
      name: 'paper-portfolio',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);