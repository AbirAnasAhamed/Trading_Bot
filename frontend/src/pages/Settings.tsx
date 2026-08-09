import React, { useState } from 'react';
import { User, Key } from 'lucide-react';
import { UserProfileSettings } from '../features/settings/UserProfileSettings';
import { ExchangeKeysManager } from '../features/settings/ExchangeKeysManager';
import { TelegramSettings } from '../features/settings/TelegramSettings';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'api-keys' | 'telegram'>('profile');

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
        <h2 className="text-xl font-bold text-primary mb-4 px-2">Settings</h2>
        
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'profile' 
              ? 'bg-[var(--color-brand)] text-white shadow-lg' 
              : 'text-secondary hover:bg-panel hover:text-primary'
          }`}
        >
          <User className="w-5 h-5 mr-3" />
          <span className="font-medium">User Profile</span>
        </button>
        
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'api-keys' 
              ? 'bg-[var(--color-brand)] text-white shadow-lg' 
              : 'text-secondary hover:bg-panel hover:text-primary'
          }`}
        >
          <Key className="w-5 h-5 mr-3" />
          <span className="font-medium">API Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'telegram' 
              ? 'bg-[var(--color-brand)] text-white shadow-lg' 
              : 'text-secondary hover:bg-panel hover:text-primary'
          }`}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-18 8a2.25 2.25 0 0 0 .12 4.17l5.225 1.742 2.15 6.45a2.25 2.25 0 0 0 4.144.184l2.87-4.305 4.545 3.409a2.25 2.25 0 0 0 3.593-1.63L23.448 3.32a2.25 2.25 0 0 0-2.25-2.887zM8.5 15.5l5.5-5.5"></path>
          </svg>
          <span className="font-medium">Telegram</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {activeTab === 'profile' && <UserProfileSettings />}
          {activeTab === 'api-keys' && <ExchangeKeysManager />}
          {activeTab === 'telegram' && <TelegramSettings />}
        </div>
      </div>
      
    </div>
  );
};
