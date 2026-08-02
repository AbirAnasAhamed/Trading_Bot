import React from 'react';
import { BrainCircuit, Clock } from 'lucide-react';

export const MLStudio: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="bg-panel border border-panel rounded-full p-6 mb-6">
        <BrainCircuit className="w-16 h-16 text-purple-500 animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold text-primary mb-4">ML Training Studio</h2>
      <p className="text-lg text-secondary max-w-lg mb-8">
        We are building a robust machine learning studio to train, deploy, and evaluate intelligent trading models using your custom data.
      </p>
      <div className="flex items-center px-6 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-full font-medium">
        <Clock className="w-5 h-5 mr-2" />
        Coming Soon
      </div>
    </div>
  );
};
