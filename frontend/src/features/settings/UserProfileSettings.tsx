import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api/auth';

export const UserProfileSettings: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToUpdate: { email?: string; password?: string } = {};
      if (email !== user?.email) dataToUpdate.email = email;
      if (newPassword) dataToUpdate.password = newPassword;

      if (Object.keys(dataToUpdate).length === 0) {
        setLoading(false);
        return; // Nothing to update
      }

      await authService.updateProfile(dataToUpdate);
      
      setSuccess(true);
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);
      
      // If email changed, we might want to log them out or refresh token.
      // For now, if password or email changes, let's keep it simple.
      if (dataToUpdate.email || dataToUpdate.password) {
         // You could logout here, or just let them continue.
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await authService.deleteAccount();
      logout();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-panel border border-panel rounded-xl shadow-sm p-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center mb-6">
          <UserIcon className="w-6 h-6 mr-3 text-brand" style={{ color: 'var(--color-brand)' }} />
          <h2 className="text-lg font-bold text-primary">Profile Overview</h2>
        </div>
        
        <div className="flex items-center space-x-4 mb-8 p-4 bg-background border border-panel rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary border-2 border-brand">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary capitalize">{user?.email?.split('@')[0] || 'Trader'}</h3>
            <p className="text-sm text-secondary flex items-center mt-1">
              <Mail className="w-4 h-4 mr-1.5" />
              {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <h3 className="text-sm font-semibold text-primary border-b border-panel pb-2">Security & Credentials</h3>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep same"
                className="w-full bg-primary border border-panel rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-brand transition-colors placeholder:text-muted"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center space-x-3 border-t border-panel">
            <button 
              type="submit" 
              disabled={loading || (email === user?.email && !newPassword)}
              className="flex items-center px-6 py-2 bg-[var(--color-brand)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </button>
            
            {success && (
              <span className="flex items-center text-green-500 text-sm font-medium animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Profile updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-panel border border-panel rounded-xl shadow-sm p-6 animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 mr-3 text-red-500" />
          <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
        </div>
        <p className="text-sm text-secondary mb-4">
          Once you delete your account, there is no going back. All your connected exchange keys, trade history, and bots will be permanently deleted. Please be certain.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="px-4 py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};
