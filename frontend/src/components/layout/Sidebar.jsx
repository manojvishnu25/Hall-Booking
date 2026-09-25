import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Radio,
  Clock,
  Calendar,
  History,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronLeft,
  Menu,
  UserCheck,
  Lock,
  Layers,
  Bot,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deniedToast, setDeniedToast] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Intercept click if user is NOT logged in
  const handleProtectedClick = (e, moduleName) => {
    if (!user) {
      e.preventDefault();
      setDeniedToast(`🔒 Access Denied: Please log in first to access the ${moduleName} module.`);
      navigate('/', { state: { errorMsg: `Please log in first to access the ${moduleName} module.` } });
      setTimeout(() => setDeniedToast(null), 4000);
    } else {
      setMobileOpen(false);
    }
  };

  const brandHomeLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : '/dept/dashboard'
    : '/';

  return (
    <>
      {/* Access Denied Floating Toast Notification */}
      {deniedToast && (
        <div className="fixed top-5 right-5 z-50 glass-panel p-4 rounded-2xl border border-rose-500/40 text-xs font-bold text-rose-400 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <div>{deniedToast}</div>
        </div>
      )}

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 shadow-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        ></div>
      )}

      {/* Left Sidebar Navigation Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen glass-panel border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Top Brand Logo & College Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <Link to={brandHomeLink} className="flex items-center space-x-3 overflow-hidden group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 via-blue-600/30 to-purple-600/30 p-0.5 border border-amber-400/40 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
                <img src="/college_logo.jpg" alt="Jai Shriram Engineering College Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <h2 className="font-extrabold text-sm text-white tracking-tight leading-tight bg-gradient-to-r from-amber-300 via-white to-blue-200 bg-clip-text text-transparent">
                    Jai Shriram Engineering College
                  </h2>
                  <p className="text-[10px] font-medium text-blue-300/90 truncate mt-0.5">
                    Centralized Hall & Auditorium Booking System
                  </p>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Module Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {/* 1. AUTHENTICATION MODULE */}
            <div>
              {!collapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  AUTHENTICATION GATE
                </span>
              )}

              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/')
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Login Portal"
              >
                <LogIn className="w-4 h-4 flex-shrink-0 text-blue-400" />
                {!collapsed && <span>Login Page</span>}
              </Link>
            </div>

            {/* 2. CAMPUS MODULES (STRICTLY PROTECTED) */}
            <div>
              {!collapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>CAMPUS MODULES</span>
                  {!user && <Lock className="w-3 h-3 text-rose-400" />}
                </span>
              )}

              <nav className="space-y-1">
                <Link
                  to="/ai-assistant"
                  onClick={(e) => handleProtectedClick(e, 'AI Event Assistant')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/ai-assistant')
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-amber-300 hover:text-white hover:bg-slate-900 border border-amber-500/20'
                  }`}
                  title="AI Event Assistant"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 flex-shrink-0 text-amber-400 animate-pulse" />
                    {!collapsed && (
                      <span className="flex items-center gap-1.5">
                        AI Event Assistant <Sparkles className="w-3 h-3 text-amber-400" />
                      </span>
                    )}
                  </div>
                  {!user && !collapsed && <Lock className="w-3 h-3 text-slate-500" />}
                </Link>

                <Link
                  to="/public/dashboard"
                  onClick={(e) => handleProtectedClick(e, 'Live Hall Status')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/public/dashboard')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Live Hall Availability"
                >
                  <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4 flex-shrink-0 text-rose-400 animate-pulse" />
                    {!collapsed && <span>Live Hall Status</span>}
                  </div>
                  {!user && !collapsed && <Lock className="w-3 h-3 text-slate-500" />}
                </Link>

                <Link
                  to="/schedule"
                  onClick={(e) => handleProtectedClick(e, 'Daily Schedule')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/schedule')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Today's Schedule"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    {!collapsed && <span>Daily Schedule Register</span>}
                  </div>
                  {!user && !collapsed && <Lock className="w-3 h-3 text-slate-500" />}
                </Link>

                <Link
                  to="/calendar"
                  onClick={(e) => handleProtectedClick(e, 'Visual Calendar')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/calendar')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Visual Calendar Matrix"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                    {!collapsed && <span>Visual Calendar View</span>}
                  </div>
                  {!user && !collapsed && <Lock className="w-3 h-3 text-slate-500" />}
                </Link>

                <Link
                  to="/past-events"
                  onClick={(e) => handleProtectedClick(e, 'Past Events')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/past-events')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Past & Finished Events Archive"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    {!collapsed && <span>Past & Finished Events</span>}
                  </div>
                  {!user && !collapsed && <Lock className="w-3 h-3 text-slate-500" />}
                </Link>
              </nav>
            </div>

            {/* 3. DEPARTMENT MODULES (Logged in as Dept) */}
            {user?.role === 'department' && (
              <div>
                {!collapsed && (
                  <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    DEPARTMENT MODULES
                  </span>
                )}

                <nav className="space-y-1">
                  <Link
                    to="/dept/book"
                    onClick={() => setMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/dept/book')
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title="Book a Hall"
                  >
                    <PlusCircle className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>Book a Campus Hall</span>}
                  </Link>

                  <Link
                    to="/dept/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/dept/dashboard')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                    title="My Bookings"
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-blue-400" />
                    {!collapsed && <span>My Reservations</span>}
                  </Link>
                </nav>
              </div>
            )}

            {/* 4. SUPER ADMIN MODULES (Logged in as Admin) */}
            {user?.role === 'admin' && (
              <div>
                {!collapsed && (
                  <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    ADMINISTRATION
                  </span>
                )}

                <nav className="space-y-1">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/admin/dashboard')
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'text-purple-400 hover:bg-purple-500/10'
                    }`}
                    title="Super Admin Panel"
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>Super Admin Console</span>}
                  </Link>
                </nav>
              </div>
            )}
          </div>

          {/* User Profile Card at Bottom of Sidebar */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
            {user ? (
              <div className="flex items-center justify-between">
                {!collapsed && (
                  <div className="truncate pr-2">
                    <span className="text-xs font-bold text-white block truncate flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      {user.role === 'admin' ? 'Super Admin' : user.department_code}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {user.role === 'admin' ? 'Full Controller' : user.department_name}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-1">
                <span className="text-[11px] font-semibold text-rose-400 flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> {!collapsed && 'Login Required'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
