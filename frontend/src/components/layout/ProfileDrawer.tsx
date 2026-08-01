import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, Activity, X, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return twMerge(clsx(inputs));
};

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const formattedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[60]",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-panel border-l border-panel shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-panel">
          <h2 className="text-xl font-bold text-primary flex items-center">
            <User className="w-5 h-5 mr-2 text-brand" style={{ color: 'var(--color-brand)' }} />
            My Profile
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-brand text-4xl shadow-inner border border-panel">
              <User className="w-12 h-12" style={{ color: 'var(--color-brand)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">{user.email.split('@')[0]}</h2>
              <div className="flex items-center justify-center text-secondary mt-1 text-sm">
                <Mail className="w-4 h-4 mr-1.5" /> {user.email}
              </div>
              <div className="flex items-center justify-center text-secondary mt-1 text-sm">
                <Calendar className="w-4 h-4 mr-1.5" /> Joined {formattedDate}
              </div>
            </div>
          </div>

          <hr className="border-panel" />

          {/* Account Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-500" /> Account Status
            </h3>
            <div className="bg-primary/50 rounded-xl p-4 space-y-3 border border-panel">
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">Role</span>
                <span className="text-primary text-sm font-medium">{user.is_superuser ? 'Administrator' : 'Trader'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">User ID</span>
                <span className="text-primary text-xs font-mono bg-panel px-2 py-1 rounded">#{user.id}</span>
              </div>
            </div>
          </div>

          {/* Security & Permissions Card */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Security
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-primary hover:bg-primary/80 transition-colors rounded-xl border border-panel text-primary flex justify-between items-center text-sm">
                Change Password
                <span className="text-xs text-blue-400">Update</span>
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-primary hover:bg-primary/80 transition-colors rounded-xl border border-panel text-primary flex justify-between items-center text-sm">
                Two-Factor Auth
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">Coming Soon</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-panel bg-primary/30">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
