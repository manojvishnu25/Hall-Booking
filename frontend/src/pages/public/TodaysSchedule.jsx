import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Clock,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export default function TodaysSchedule() {
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHall, setSelectedHall] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { lastUpdate } = useSocket();

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const [bookingsRes, hallsRes] = await Promise.all([
        api.get(`/bookings?date=${selectedDate}`),
        api.get('/halls')
      ]);
      setBookings(bookingsRes.data);
      setHalls(hallsRes.data);
    } catch (err) {
      console.error('Error fetching today schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  useEffect(() => {
    if (lastUpdate) {
      fetchSchedule();
    }
  }, [lastUpdate]);

  const filteredBookings = bookings.filter(b => {
    const matchesHall = selectedHall === 'ALL' || b.hall_id === parseInt(selectedHall, 10);
    const matchesSearch =
      b.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.organizer_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesHall && matchesSearch;
  });

  const nowTime = new Date().toTimeString().slice(0, 5);
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Daily Timeline Register
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Campus Hall Schedule & Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological view of all events booked across departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by event, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 text-sm text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Halls</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.hall_name} ({h.hall_type})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl animate-pulse">
          Loading schedule records...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Bookings Scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">There are no confirmed hall bookings on {selectedDate}.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Event & Type</th>
                  <th className="py-3.5 px-4">Hall Name</th>
                  <th className="py-3.5 px-4">Organizing Dept</th>
                  <th className="py-3.5 px-4">Participants</th>
                  <th className="py-3.5 px-4">Organizer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map(b => {
                  const isLive = isToday && b.start_time <= nowTime && b.end_time > nowTime;
                  const isUpcoming = isToday ? b.start_time > nowTime : new Date(selectedDate) > new Date();

                  return (
                    <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-100 whitespace-nowrap">
                        {b.start_time} - {b.end_time}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 pulse-live">
                            <Radio className="w-3 h-3" /> LIVE NOW
                          </span>
                        ) : isUpcoming ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> UPCOMING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                            <CheckCircle2 className="w-3 h-3" /> COMPLETED
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{b.event_name}</div>
                        <span className="inline-block mt-0.5 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {b.event_type}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{b.hall_name}</div>
                        <div className="text-xs text-slate-400">{b.hall_type}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-400">{b.department_code}</span>
                        <div className="text-xs text-slate-400">{b.department_name}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-300">
                        {b.participants} / {b.hall_capacity} seats
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                        <div className="font-semibold text-slate-200">{b.organizer_name}</div>
                        <div>{b.organizer_contact}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
