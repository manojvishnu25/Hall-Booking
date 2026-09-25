import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Key, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setLoading(true);
      await loginAdmin(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-purple-500/20 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Console</h1>
          <p className="text-xs text-slate-400">System Controller & Master Administration Access</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Username</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Authenticating...' : <>Login to Admin Panel <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1">
          <div className="font-bold text-purple-400">Demo Admin Login:</div>
          <p className="text-slate-400 text-[11px]">
            Username: <strong className="text-white">admin</strong> • Password: <code className="text-amber-400 font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
