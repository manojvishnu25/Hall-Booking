import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Card3D from '../../components/common/Card3D';
import {
  PlusCircle,
  Calendar,
  Clock,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';

export default function DeptDashboard() {
  const { user } = useAuth();
  const { lastUpdate } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionAlert, setActionAlert] = useState(null);

  const fetchDeptBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error loading department bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptBookings();
  }, []);

  useEffect(() => {
    if (lastUpdate) {
      fetchDeptBookings();
    }
  }, [lastUpdate]);

  const handleCancelBooking = async (id, eventName) => {
    if (!window.confirm(`Are you sure you want to cancel the booking for "${eventName}"?`)) {
      return;
    }

    try {
      await api.delete(`/bookings/${id}`);
      setActionAlert({ type: 'success', text: `Booking for "${eventName}" has been cancelled.` });
      fetchDeptBookings();
    } catch (err) {
      setActionAlert({ type: 'error', text: err.response?.data?.error || 'Failed to cancel booking.' });
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      b.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hall_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.event_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const upcomingCount = bookings.filter(b => new Date(b.event_date) >= new Date() && b.status === 'confirmed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            {user?.department_code} Control Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Department Bookings & Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user?.department_name} • Manage hall reservations and track event history.
          </p>
        </div>

        <Link
          to="/dept/book"
          className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-transform hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Book New Hall
        </Link>
      </div>

      {actionAlert && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
          actionAlert.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div>{actionAlert.text}</div>
        </div>
      )}

      {/* 3D Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card3D glowColor="blue" className="border-l-4 border-l-blue-500 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Department Bookings</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalBookings}</h3>
        </Card3D>

        <Card3D glowColor="gold" className="border-l-4 border-l-amber-500 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase flex items-center justify-between">
            <span>Pending Approvals</span>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</h3>
        </Card3D>

        <Card3D glowColor="emerald" className="border-l-4 border-l-emerald-500 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Confirmed Reservations</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{confirmedCount}</h3>
        </Card3D>

        <Card3D glowColor="purple" className="border-l-4 border-l-indigo-500 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Upcoming Reserved Events</p>
          <h3 className="text-2xl font-bold text-indigo-400 mt-1">{upcomingCount}</h3>
        </Card3D>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search my bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 text-sm text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          {['ALL', 'confirmed', 'pending', 'cancelled'].map(stat => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                statusFilter === stat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl animate-pulse">
          Fetching department bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Bookings Found</h3>
          <p className="text-xs text-slate-500 mt-1">You haven't made any bookings matching your current filter.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event Name & Type</th>
                  <th className="py-3.5 px-4">Hall Venue</th>
                  <th className="py-3.5 px-4">Date & Timing</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
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
                      <div className="font-bold text-amber-400">{b.event_date}</div>
                      <div className="text-xs font-mono text-slate-400">{b.start_time} - {b.end_time}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-300">
                      {b.participants} / {b.hall_capacity} seats
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                      <div className="font-semibold text-slate-200">{b.organizer_name}</div>
                      <div className="text-[10px] text-blue-400 font-semibold">{b.organizer_designation || 'Faculty In-Charge'}</div>
                      <div className="text-[11px] text-slate-400">{b.organizer_contact}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {b.status === 'confirmed' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      )}

                      {b.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Pending Approval
                        </span>
                      )}

                      {b.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
                          <XCircle className="w-3.5 h-3.5" /> Rejected by Admin
                        </span>
                      )}

                      {b.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1 w-fit">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(b.id, b.event_name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
