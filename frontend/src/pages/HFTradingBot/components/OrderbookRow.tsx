import React from 'react';

interface OrderbookRowProps {
  price: number;
  amount: number;
  total: number;
  maxTotal: number;
  type: 'bid' | 'ask';
}

export const OrderbookRow: React.FC<OrderbookRowProps> = React.memo(({
  price,
  amount,
  total,
  maxTotal,
  type
}) => {
  const depthPercentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  
  const textColorClass = type === 'bid' ? 'text-green-500' : 'text-red-500';
  const bgClass = type === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10';

  return (
    <div className="relative grid grid-cols-3 text-xs py-[2px] px-2 hover:bg-white/5 cursor-pointer z-10 group overflow-hidden flex-shrink-0">
      {/* Depth Background */}
      <div 
        className={`absolute top-0 right-0 h-full ${bgClass} z-[-1] transition-all duration-300 ease-in-out`} 
        style={{ width: `${depthPercentage}%` }}
      />
      
      <span className={`${textColorClass} font-medium z-10 text-left`}>
        {price < 0.01 ? price.toFixed(6) : price < 1 ? price.toFixed(4) : price.toFixed(2)}
      </span>
      <span className="text-gray-300 z-10 text-center">
        {amount > 1000 ? (amount / 1000).toFixed(2) + 'k' : amount.toFixed(amount < 1 ? 4 : 2)}
      </span>
      <span className="text-gray-400 z-10 text-right">
        {total > 1000 ? (total / 1000).toFixed(2) + 'k' : total.toFixed(total < 1 ? 4 : 2)}
      </span>
    </div>
  );
}, (prev, next) => {
  // Custom equality check for aggressive RAM optimization
  // Only re-render if price or amount changes significantly
  return prev.price === next.price && prev.amount === next.amount;
});

OrderbookRow.displayName = 'OrderbookRow';
