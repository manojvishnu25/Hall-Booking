import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, LogOut, Radio, LogIn, ShieldCheck } from 'lucide-react';

export default function CollegeHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const brandHomeLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : '/dept/dashboard'
    : '/';

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Prominent College Logo & Mandatory Header Structure */}
        <Link to={brandHomeLink} className="flex items-center space-x-3.5 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-600 to-indigo-700 p-0.5 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <img
              src="/college_logo.jpg"
              alt="Jai Shriram Engineering College Logo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-xl text-white tracking-tight leading-snug flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-300 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
                Jai Shriram Engineering College
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-blue-300/95 tracking-wide">
              Centralized Hall & Auditorium Booking System
            </p>
          </div>
        </Link>

        {/* User Session Info / Controls */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  {user.role === 'admin' ? 'Super Admin' : user.department_code}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user.role === 'admin' ? 'System Administrator' : user.department_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : location.pathname !== '/' && location.pathname !== '/login' ? (
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Login Portal
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
