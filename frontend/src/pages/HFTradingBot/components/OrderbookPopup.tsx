import React, { useState } from 'react';
import { OrderbookList } from './OrderbookList';

interface OrderbookPopupProps {
  orderbookData: { bids: number[][]; asks: number[][] };
  symbol: string;
}

export const OrderbookPopup: React.FC<OrderbookPopupProps> = ({ orderbookData, symbol }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popup Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <OrderbookList data={orderbookData} symbol={symbol} />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
            : 'bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-cyan-500/30'
        }`}
        title="Toggle Orderbook"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 9h12M6 13h12M6 17h6" />
          </svg>
        )}
      </button>
    </div>
  );
};
