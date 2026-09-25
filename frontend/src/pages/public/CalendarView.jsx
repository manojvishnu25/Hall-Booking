import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  Users,
  Clock,
  X,
  Info
} from 'lucide-react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHall, setSelectedHall] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeModalBooking, setActiveModalBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, hallsRes, deptsRes] = await Promise.all([
        api.get(`/bookings?date=${currentDate}`),
        api.get('/halls'),
        api.get('/departments')
      ]);
      setBookings(bookingsRes.data);
      setHalls(hallsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const changeDate = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const filteredHalls = halls.filter(h => selectedHall === 'ALL' || h.id === parseInt(selectedHall, 10));

  const filteredBookings = bookings.filter(b => {
    const matchesDept = selectedDept === 'ALL' || b.department_id === parseInt(selectedDept, 10);
    return matchesDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Google Calendar Style Visual Matrix
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Campus Booking Visual Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Interactive grid showing hall availability and booked time slots across hours.
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-700">
          <button
            onClick={() => changeDate(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent text-white font-bold text-sm focus:outline-none"
          />
          <button
            onClick={() => changeDate(1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter By Hall:</span>
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Halls</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.hall_name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Filter By Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_code} - {d.department_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Timeline */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl animate-pulse">
          Building visual calendar grid...
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto shadow-2xl">
          <div className="min-w-[900px]">
            {/* Grid Header (Halls as columns) */}
            <div className="grid grid-cols-12 bg-slate-900/90 border-b border-slate-800 text-xs font-bold text-slate-300">
              <div className="col-span-2 p-3 text-center border-r border-slate-800 bg-slate-950/60">
                TIME SLOT
              </div>
              <div className="col-span-10 grid grid-cols-5">
                {filteredHalls.map(hall => (
                  <div key={hall.id} className="p-3 text-center border-r border-slate-800/80 truncate">
                    <span className="text-blue-400 font-bold block">{hall.hall_name}</span>
                    <span className="text-[10px] text-slate-500">{hall.hall_type} ({hall.capacity} cap)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Rows */}
            <div className="divide-y divide-slate-800/60">
              {hours.map((hourStr, idx) => {
                const nextHourStr = hours[idx + 1] || '21:00';

                return (
                  <div key={hourStr} className="grid grid-cols-12 min-h-[70px] hover:bg-slate-900/30 transition-colors">
                    {/* Hour Label Column */}
                    <div className="col-span-2 p-3 text-xs font-mono font-bold text-slate-400 border-r border-slate-800 flex items-center justify-center bg-slate-950/40">
                      {hourStr} - {nextHourStr}
                    </div>

                    {/* Hall Columns */}
                    <div className="col-span-10 grid grid-cols-5">
                      {filteredHalls.map(hall => {
                        // Find booking in this hall that intersects with hourStr
                        const matchingBooking = filteredBookings.find(b => {
                          if (b.hall_id !== hall.id) return false;
                          return b.start_time < nextHourStr && b.end_time > hourStr;
                        });

                        return (
                          <div
                            key={hall.id}
                            className="p-1.5 border-r border-slate-800/80 relative flex items-center justify-center"
                          >
                            {matchingBooking ? (
                              <button
                                onClick={() => setActiveModalBooking(matchingBooking)}
                                className="w-full h-full p-2 rounded-xl text-left bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/40 hover:border-blue-400 hover:scale-[1.02] transition-all shadow-md group overflow-hidden"
                              >
                                <div className="text-[10px] font-bold text-blue-300 flex items-center justify-between">
                                  <span>{matchingBooking.department_code}</span>
                                  <span>{matchingBooking.start_time}-{matchingBooking.end_time}</span>
                                </div>
                                <div className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-blue-200">
                                  {matchingBooking.event_name}
                                </div>
                                <div className="text-[10px] text-slate-300 truncate">
                                  {matchingBooking.event_type} • {matchingBooking.participants} guests
                                </div>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-700 font-medium">AVAILABLE</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Preview Modal */}
      {activeModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModalBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <Info className="w-4 h-4" /> Hall Booking Details
            </div>

            <h2 className="text-xl font-bold text-white">{activeModalBooking.event_name}</h2>
            <p className="text-xs text-slate-400 mt-1">{activeModalBooking.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 gap-3 my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Organizing Department</span>
                <strong className="text-indigo-400 font-bold">{activeModalBooking.department_code} - {activeModalBooking.department_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Hall Assigned</span>
                <strong className="text-white font-bold">{activeModalBooking.hall_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Date & Time</span>
                <strong className="text-amber-400 font-bold">{activeModalBooking.event_date} ({activeModalBooking.start_time} - {activeModalBooking.end_time})</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Participants</span>
                <strong className="text-white font-bold">{activeModalBooking.participants} Guests</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Organizer Contact</span>
                <strong className="text-slate-200">{activeModalBooking.organizer_name} ({activeModalBooking.organizer_contact})</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Special Reqs</span>
                <strong className="text-slate-200">{activeModalBooking.special_requirements || 'None'}</strong>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModalBooking(null)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-500"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
