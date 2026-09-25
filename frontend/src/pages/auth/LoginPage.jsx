import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Key,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

export default function LoginPage() {
  const { user, loginDepartment, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('dept'); // 'dept' or 'admin'

  // Dept Login Form State
  const [deptCode, setDeptCode] = useState('AIDS001');
  const [deptPassword, setDeptPassword] = useState('dept123');

  // Admin Login Form State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [errorMsg, setErrorMsg] = useState(location.state?.errorMsg || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.errorMsg) {
      setErrorMsg(location.state.errorMsg);
    }
  }, [location.state]);

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setLoading(true);
      await loginDepartment(deptCode, deptPassword);
      navigate('/dept/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid Department ID or Password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setLoading(true);
      await loginAdmin(adminUsername, adminPassword);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid Admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6">
        {/* College Branding */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-600 to-indigo-700 p-1 shadow-2xl shadow-amber-500/20">
            <img src="/college_logo.jpg" alt="Jai Shriram Engineering College Logo" className="w-full h-full object-cover rounded-[22px]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Official Campus Venue Authorization Portal
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-amber-300 via-white to-blue-200 bg-clip-text text-transparent">
              Jai Shriram Engineering College
            </h1>
            <p className="text-sm font-bold text-blue-300/95 mt-1">
              Centralized Hall & Auditorium Booking System
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Mandatory Authentication Portal. Please log in first to unlock system modules.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setActiveTab('dept'); setErrorMsg(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dept'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Department Login
            </button>

            <button
              onClick={() => { setActiveTab('admin'); setErrorMsg(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Super Admin
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-bold text-rose-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <Lock className="w-5 h-5 flex-shrink-0" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Department Login Form */}
          {activeTab === 'dept' && (
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department ID / Code *</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. AIDS001, CSE001, ECE001"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={deptPassword}
                    onChange={(e) => setDeptPassword(e.target.value)}
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
                {loading ? 'Authenticating...' : <>Click Here to Login & Access Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-blue-400">Demo Department Credentials:</span>
                <p className="text-[11px] text-slate-400">
                  • <strong>AIDS001</strong> • <strong>CSE001</strong> • <strong>ECE001</strong> • <strong>MBA001</strong> (Password: <code className="text-amber-400 font-mono">dept123</code>)
                </p>
              </div>
            </form>
          )}

          {/* Super Admin Login Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Username *</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
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
                {loading ? 'Authenticating...' : <>Click Here to Login & Access Admin Console <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-purple-400">Demo Admin Credential:</span>
                <p className="text-[11px] text-slate-400">
                  Username: <strong className="text-white">admin</strong> • Password: <code className="text-amber-400 font-mono">admin123</code>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
