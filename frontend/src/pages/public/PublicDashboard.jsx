import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import Card3D from '../../components/common/Card3D';
import {
  Building2,
  Users,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export default function PublicDashboard() {
  const [availabilityData, setAvailabilityData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { lastUpdate } = useSocket();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, statsRes] = await Promise.all([
        api.get(`/halls/availability?date=${selectedDate}`),
        api.get('/reports/stats')
      ]);
      setAvailabilityData(availRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching public dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Re-fetch automatically when socket emits updates
  useEffect(() => {
    if (lastUpdate) {
      fetchData();
    }
  }, [lastUpdate]);

  const filteredHalls = availabilityData?.halls?.filter(hall => {
    const matchesSearch =
      hall.hall_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hall.currentEvent?.event_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hall.currentEvent?.department_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || hall.hall_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/90 p-8 border border-slate-800/80 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Official Campus Venue Authorization & Monitoring
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Real-Time Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">Hall Availability</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Live status monitoring for Auditoriums, Seminar Halls, and Conference Halls. Double booking prevention system active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
              <CalendarIcon className="w-5 h-5 text-blue-400 ml-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Halls</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.totalHalls || 0}</h3>
            <span className="text-[11px] text-slate-500">
              {stats?.auditoriums || 0} Audi • {stats?.seminarHalls || 0} Seminar • {stats?.conferenceHalls || 0} Conf
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Now</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{stats?.availableNow || 0}</h3>
            <span className="text-[11px] text-slate-500">Ready for booking</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4 border-rose-500">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupied Now</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-0.5">{stats?.occupiedNow || 0}</h3>
            <span className="text-[11px] text-slate-500">Events in session</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Events</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-0.5">{stats?.todayEvents || 0}</h3>
            <span className="text-[11px] text-slate-500">Across all departments</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by hall, event, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 text-sm text-white rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:block" />
          {['ALL', 'Auditorium', 'Seminar Hall', 'Conference Hall'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Live Hall Status Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 glass-card rounded-2xl animate-pulse p-6"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls?.map(hall => {
            const isOccupied = hall.currentStatus === 'Currently Occupied';
            const isMaintenance = hall.currentStatus === 'Maintenance';
            const isAvailable = hall.currentStatus === 'Available';

            const glow = isOccupied ? 'rose' : isMaintenance ? 'purple' : 'emerald';

            return (
              <Card3D
                key={hall.id}
                glowColor={glow}
                className={`relative overflow-hidden flex flex-col justify-between border-t-2 ${
                  isOccupied
                    ? 'border-t-rose-500'
                    : isMaintenance
                    ? 'border-t-slate-500'
                    : 'border-t-emerald-500'
                }`}
              >
                <div>
                  {/* Top Badge & Code */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {hall.hall_code}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">{hall.hall_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{hall.location}</p>
                    </div>

                    {/* Status Pill */}
                    {isOccupied && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 pulse-live">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> LIVE NOW
                      </span>
                    )}

                    {isAvailable && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AVAILABLE
                      </span>
                    )}

                    {isMaintenance && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> MAINTENANCE
                      </span>
                    )}
                  </div>

                  {/* Hall Specs */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 my-3 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Layers className="w-3.5 h-3.5 text-blue-400" /> {hall.hall_type}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> {hall.capacity} Seats
                    </span>
                  </div>

                  {/* Current Event Box */}
                  {hall.currentEvent ? (
                    <div className="mt-4 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                        <span>🔴 OCCUPIED NOW</span>
                        <span>{hall.currentEvent.start_time} - {hall.currentEvent.end_time}</span>
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-1">{hall.currentEvent.event_name}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-rose-900/40">
                        <span>Dept: <strong className="text-slate-200">{hall.currentEvent.department_code}</strong></span>
                        <span>Participants: <strong className="text-slate-200">{hall.currentEvent.participants}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center py-4">
                      <p className="text-xs font-semibold text-emerald-400">🟢 Hall Available Right Now</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">No ongoing active booking</p>
                    </div>
                  )}

                  {/* Next Event Section */}
                  {hall.nextEvent && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400">
                        <span>🟡 NEXT UPCOMING</span>
                        <span>{hall.nextEvent.start_time} - {hall.nextEvent.end_time}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{hall.nextEvent.event_name}</p>
                      <p className="text-[11px] text-slate-400">Organized by {hall.nextEvent.department_name}</p>
                    </div>
                  )}
                </div>

                {/* Footer Facilities preview */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[200px]" title={hall.facilities}>
                    ⚡ {hall.facilities || 'Standard facilities'}
                  </span>
                  <span className="font-semibold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-0.5">
                    Schedule <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card3D>
            );
          })}
        </div>
      )}
    </div>
  );
}
