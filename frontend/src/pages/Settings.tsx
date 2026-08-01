import React, { useState } from 'react';
import { User, Key } from 'lucide-react';
import { UserProfileSettings } from '../features/settings/UserProfileSettings';
import { ExchangeKeysManager } from '../features/settings/ExchangeKeysManager';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api-keys'>('profile');

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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {activeTab === 'profile' && <UserProfileSettings />}
          {activeTab === 'api-keys' && <ExchangeKeysManager />}
        </div>
      </div>
      
    </div>
  );
};
