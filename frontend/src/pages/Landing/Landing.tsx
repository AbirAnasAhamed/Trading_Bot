import { useState } from 'react';
import { Activity, Shield, Zap, ChevronRight, BarChart3 } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

export const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800/50 bg-[#0F172A]/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NexusTrade
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowLogin(true)}
              className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => setShowRegister(true)}
              className="px-5 py-2 text-sm font-medium bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          SaaS Beta Version 2.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Next-Gen Algorithmic <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Trading Infrastructure
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Deploy high-frequency bots, execute advanced L2 Orderbook strategies, and manage risk with military-grade precision. Engineered for elite traders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1"
          >
            Start Trading Now
            <ChevronRight className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm">
            View Documentation
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 text-left">
          {[
            { icon: Zap, title: 'Ultra-Low Latency', desc: 'Asynchronous event loop architectures executing trades in milliseconds.', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { icon: Shield, title: 'Bank-Grade Security', desc: 'End-to-end Fernet encryption for API keys and JWT stateless authentication.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { icon: BarChart3, title: 'ML & Backtesting', desc: 'Distributed Celery workers powered by Redis to train and backtest your strategies.', color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/50 transition-colors group cursor-pointer">
              <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
    </div>
  );
};
