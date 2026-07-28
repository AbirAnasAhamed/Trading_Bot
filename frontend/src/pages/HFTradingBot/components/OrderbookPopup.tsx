import React, { useState } from 'react';
import { OrderbookList } from './OrderbookList';
import { DeployBotModal } from './DeployBot/DeployBotModal';

interface OrderbookPopupProps {
  orderbookData: { bids: number[][]; asks: number[][] };
  symbol: string;
}

export const OrderbookPopup: React.FC<OrderbookPopupProps> = ({ orderbookData, symbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Popup Window */}
        {isOpen && (
          <div className="mb-4 w-80 h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <OrderbookList data={orderbookData} symbol={symbol} />
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all duration-300 group"
            title="Deploy Wallhunter Bot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
          </button>

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
      </div>

      <DeployBotModal 
        isOpen={isDeployModalOpen} 
        onClose={() => setIsDeployModalOpen(false)} 
        symbol={symbol} 
      />
    </>
  );
};
