import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Key, UserCheck, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DeptLogin() {
  const [departmentCode, setDepartmentCode] = useState('AIDS001');
  const [password, setPassword] = useState('dept123');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginDepartment } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setLoading(true);
      await loginDepartment(departmentCode, password);
      navigate('/dept/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Department Login</h1>
          <p className="text-xs text-slate-400">Access hall booking portal with your Department ID</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department ID / Code</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. AIDS001, CSE001"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Authenticating...' : <>Login to Department Portal <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5">
          <div className="font-bold text-blue-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Demo Department Logins:
          </div>
          <p className="text-slate-400 text-[11px]">
            • <strong>AIDS001</strong> / Password: <code className="text-amber-400 font-mono">dept123</code><br/>
            • <strong>CSE001</strong> / Password: <code className="text-amber-400 font-mono">dept123</code><br/>
            • <strong>ECE001</strong> / Password: <code className="text-amber-400 font-mono">dept123</code><br/>
            • <strong>MBA001</strong> / Password: <code className="text-amber-400 font-mono">dept123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
