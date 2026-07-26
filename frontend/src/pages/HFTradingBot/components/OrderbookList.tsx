import React, { useMemo } from 'react';
import { OrderbookRow } from './OrderbookRow';

interface OrderbookListProps {
  data: { bids: number[][]; asks: number[][] };
  symbol: string;
}

export const OrderbookList: React.FC<OrderbookListProps> = ({ data, symbol }) => {
  const { bids, asks } = data;

  // Optimize calculation using useMemo to avoid recalculating on every tiny render
  const { processedBids, processedAsks, maxTotal } = useMemo(() => {
    let currentBidTotal = 0;
    let currentAskTotal = 0;
    let maxT = 0;

    const pBids = bids.slice(0, 20).map(([price, amount]) => {
      currentBidTotal += amount;
      if (currentBidTotal > maxT) maxT = currentBidTotal;
      return { price, amount, total: currentBidTotal };
    });

    // For asks, we usually display them descending (lowest ask at bottom, closest to mid price)
    // We get top 20, but we need to calculate total from bottom (best ask) up.
    // ccxt returns asks sorted by price ascending (best ask first).
    const topAsks = asks.slice(0, 20);
    const pAsks = topAsks.map(([price, amount]) => {
      currentAskTotal += amount;
      if (currentAskTotal > maxT) maxT = currentAskTotal;
      return { price, amount, total: currentAskTotal };
    });

    // Reverse asks so the best ask is at the bottom of the top half
    return {
      processedBids: pBids,
      processedAsks: pAsks.reverse(),
      maxTotal: maxT,
    };
  }, [bids, asks]);

  // Mid price calculation
  const bestBid = bids.length > 0 ? bids[0][0] : 0;
  const bestAsk = asks.length > 0 ? asks[0][0] : 0;
  const midPrice = bestBid && bestAsk ? ((bestBid + bestAsk) / 2) : 0;
  const spread = bestAsk - bestBid;

  return (
    <div className="flex flex-col h-full bg-panel text-xs border border-panel rounded-lg overflow-hidden w-full max-w-sm font-mono shadow-xl">
      {/* Symbol Title Header */}
      <div className="text-center px-2 py-2 border-b border-panel font-bold text-white bg-background">
        {symbol || 'Loading...'} Orderbook
      </div>
      {/* Header */}
      <div className="grid grid-cols-3 px-2 py-1 border-b border-panel text-gray-400 font-semibold bg-background/50">
        <span className="text-left">Price</span>
        <span className="text-center">Amount</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div className="flex flex-col flex-1 overflow-y-auto py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {processedAsks.map((ask, i) => (
          <OrderbookRow
            key={`ask-${ask.price}-${i}`}
            price={ask.price}
            amount={ask.amount}
            total={ask.total}
            maxTotal={maxTotal}
            type="ask"
          />
        ))}
      </div>

      {/* Spread / Mid Price Indicator */}
      <div className="py-2 px-2 flex justify-between items-center bg-background border-y border-panel flex-shrink-0">
        <span className="text-lg font-bold text-white">
           {midPrice < 0.01 ? midPrice.toFixed(6) : midPrice < 1 ? midPrice.toFixed(4) : midPrice.toFixed(2)}
        </span>
        <span className="text-gray-400">
           Spread: {spread < 0.01 ? spread.toFixed(6) : spread < 1 ? spread.toFixed(4) : spread.toFixed(2)}
        </span>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="flex flex-col flex-1 overflow-y-auto py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {processedBids.map((bid, i) => (
          <OrderbookRow
            key={`bid-${bid.price}-${i}`}
            price={bid.price}
            amount={bid.amount}
            total={bid.total}
            maxTotal={maxTotal}
            type="bid"
          />
        ))}
      </div>
    </div>
  );
};
