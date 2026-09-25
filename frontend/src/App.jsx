import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/layout/Sidebar';
import CollegeHeader from './components/layout/CollegeHeader';
import Background3DCanvas from './components/common/Background3DCanvas';
import ThemeSelector from './components/common/ThemeSelector';
import LoginPage from './pages/auth/LoginPage';
import PublicDashboard from './pages/public/PublicDashboard';
import TodaysSchedule from './pages/public/TodaysSchedule';
import CalendarView from './pages/public/CalendarView';
import PastEvents from './pages/public/PastEvents';

import DeptDashboard from './pages/dept/DeptDashboard';
import BookHall from './pages/dept/BookHall';
import AdminDashboard from './pages/admin/AdminDashboard';
import AiAgentDashboard from './pages/ai/AiAgentDashboard';
import AiAgentWidget from './components/ai/AiAgentWidget';

// Strict Universal Auth Guard for ALL System Modules
function StrictAuthGuard({ children, requiredRole = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading user session...</div>;
  }

  // If NOT logged in, redirect strictly back to the Login Page (/)
  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ errorMsg: '🔒 Access Denied: You must log in first to access system modules.' }}
      />
    );
  }

  // Role check if specific role is requested
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dept/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const [bgMode, setBgMode] = React.useState(() => localStorage.getItem('jsec_bg_mode') || 'gold_campus');

  const handleSelectBgMode = (mode) => {
    setBgMode(mode);
    localStorage.setItem('jsec_bg_mode', mode);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic 3D Ambient Background Canvas */}
      <Background3DCanvas mode={bgMode} />

      {/* Interactive Background Theme Switcher Pill */}
      <ThemeSelector currentMode={bgMode} onSelectMode={handleSelectBgMode} />

      {/* Left Side Persistent Module Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area Offset for Left Sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64 transition-all duration-300">
        {/* Prominent Header visible across ALL modules & pages */}
        <CollegeHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Routes>
            {/* Default Root Route: Unified Login Page FIRST */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* STRICTLY PROTECTED MODULE ROUTES (Requires clicking Login first) */}
            <Route
              path="/public/dashboard"
              element={
                <StrictAuthGuard>
                  <PublicDashboard />
                </StrictAuthGuard>
              }
            />

            <Route
              path="/schedule"
              element={
                <StrictAuthGuard>
                  <TodaysSchedule />
                </StrictAuthGuard>
              }
            />

            <Route
              path="/calendar"
              element={
                <StrictAuthGuard>
                  <CalendarView />
                </StrictAuthGuard>
              }
            />

            <Route
              path="/past-events"
              element={
                <StrictAuthGuard>
                  <PastEvents />
                </StrictAuthGuard>
              }
            />

            {/* Department Protected Routes */}
            <Route
              path="/dept/dashboard"
              element={
                <StrictAuthGuard>
                  <DeptDashboard />
                </StrictAuthGuard>
              }
            />

            <Route
              path="/dept/book"
              element={
                <StrictAuthGuard>
                  <BookHall />
                </StrictAuthGuard>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <StrictAuthGuard requiredRole="admin">
                  <AdminDashboard />
                </StrictAuthGuard>
              }
            />

            {/* AI Assistant Protected Route */}
            <Route
              path="/ai-assistant"
              element={
                <StrictAuthGuard>
                  <AiAgentDashboard />
                </StrictAuthGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="glass-panel border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src="/college_logo.jpg" alt="Logo" className="w-4 h-4 rounded-full object-cover" />
              <span className="font-semibold text-slate-300">© 2026 Jai Shriram Engineering College</span>
            </div>
            <span className="text-slate-400">Centralized Hall & Auditorium Booking System</span>
          </div>
        </footer>
      </div>

      {/* Floating AI Agent Widget across all pages */}
      <AiAgentWidget />
    </div>
  );
}
