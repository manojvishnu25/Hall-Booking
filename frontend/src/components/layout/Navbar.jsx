import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  UserCheck,
  PlusCircle,
  ShieldCheck,
  Radio,
  LogIn
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Determine home link depending on user login status
  const brandHomeLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : '/dept/dashboard'
    : '/';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to={brandHomeLink} className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 via-blue-600/30 to-purple-600/30 p-0.5 border border-amber-400/40 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
              <img src="/college_logo.jpg" alt="Jai Shriram Engineering College Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-white to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
                  Jai Shriram Engineering College
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-xs font-medium text-blue-300/90 hidden sm:block">
                Centralized Hall & Auditorium Booking System
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/public/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/public/dashboard') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Live Availability
            </Link>

            <Link
              to="/schedule"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/schedule') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" /> Today's Schedule
            </Link>

            <Link
              to="/calendar"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/calendar') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-400" /> Calendar View
            </Link>

            {user?.role === 'department' && (
              <>
                <Link
                  to="/dept/book"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/dept/book') ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> Book Hall
                </Link>
                <Link
                  to="/dept/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/dept/dashboard') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> My Bookings
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin/dashboard') ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </nav>

          {/* User Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-400" />
                    {user.role === 'admin' ? 'Super Admin' : user.department_code}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {user.role === 'admin' ? 'Full Controller' : user.department_name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" /> Login Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
