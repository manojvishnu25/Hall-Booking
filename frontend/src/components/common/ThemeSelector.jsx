import React from 'react';
import { Palette, Sparkles, Zap, Layers, Globe } from 'lucide-react';

export default function ThemeSelector({ currentMode, onSelectMode }) {
  const themes = [
    { id: 'gold_campus', label: 'Golden Campus', icon: Sparkles, color: 'text-amber-400' },
    { id: 'cyber_grid', label: 'Cyber Grid 3D', icon: Zap, color: 'text-cyan-400' },
    { id: 'nebula_flow', label: 'Cosmic Nebula', icon: Palette, color: 'text-purple-400' },
    { id: 'constellation', label: 'Constellation', icon: Globe, color: 'text-blue-400' }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-panel p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-4">
      <span className="text-[10px] font-bold text-slate-400 uppercase px-2 hidden sm:flex items-center gap-1">
        <Palette className="w-3.5 h-3.5 text-amber-400" /> BG Theme:
      </span>
      {themes.map(t => {
        const Icon = t.icon;
        const active = currentMode === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectMode(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              active
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40 border border-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
            title={`Switch background theme to ${t.label}`}
          >
            <Icon className={`w-3.5 h-3.5 ${t.color}`} />
            <span className="hidden md:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
