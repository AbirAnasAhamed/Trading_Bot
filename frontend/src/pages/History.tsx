import React from 'react';

const mockTrades = [
  { id: 'TRD-1029', date: '2026-07-21 14:30:22', pair: 'BTC/USDT', type: 'BUY', price: '$64,230.50', amount: '0.05 BTC', total: '$3,211.52', bot: 'BTC Grid Bot' },
  { id: 'TRD-1028', date: '2026-07-21 12:15:05', pair: 'ETH/USDT', type: 'SELL', price: '$3,450.00', amount: '1.2 ETH', total: '$4,140.00', bot: 'ETH DCA' },
  { id: 'TRD-1027', date: '2026-07-21 09:45:10', pair: 'BTC/USDT', type: 'SELL', price: '$64,800.00', amount: '0.05 BTC', total: '$3,240.00', bot: 'BTC Grid Bot' },
  { id: 'TRD-1026', date: '2026-07-20 22:10:44', pair: 'SOL/USDT', type: 'BUY', price: '$145.20', amount: '10 SOL', total: '$1,452.00', bot: 'SOL MACD' },
];

export const History: React.FC = () => {
  return (
    <div className="space-y-6">
      
      <div className="bg-panel border border-panel rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/50 text-secondary text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Trade ID</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Pair</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Bot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {mockTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-primary/30 transition-colors text-primary">
                  <td className="px-6 py-4 text-sm font-medium">{trade.id}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{trade.date}</td>
                  <td className="px-6 py-4 text-sm font-bold">{trade.pair}</td>
                  <td className="px-6 py-4 text-sm font-bold">
                    <span className={trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{trade.price}</td>
                  <td className="px-6 py-4 text-sm">{trade.amount}</td>
                  <td className="px-6 py-4 text-sm font-medium">{trade.total}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{trade.bot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
