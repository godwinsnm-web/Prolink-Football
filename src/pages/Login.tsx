import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useLocation } from 'wouter';
import toast from 'react-hot-toast';
import { LogIn, KeyRound } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success(data.message);
        setIsForgot(false);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        login(data);
        toast.success(`Welcome back, ${data.username}!`);
        setLocation(data.role === 'ADMIN' ? '/admin' : '/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 flex justify-center bg-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 shadow-2xl rounded-2xl border border-slate-800 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              {isForgot ? <KeyRound className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isForgot ? 'Reset Password' : 'Sign in to ProLink'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isForgot ? "Enter your username to receive a reset link." : "Enter your credentials to access your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin or any username"
              />
            </div>
            
            {!isForgot && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-sm font-medium text-emerald-500 hover:text-emerald-400"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isForgot ? 'Send Reset Link' : 'Sign In'}
            </button>
          </form>

          {isForgot && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsForgot(false)}
                className="text-sm font-medium text-slate-400 hover:text-white"
              >
                Back to login
              </button>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Admin credentials: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">admin</code> / <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
