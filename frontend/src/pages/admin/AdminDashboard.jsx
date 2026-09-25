import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import Card3D from '../../components/common/Card3D';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  RefreshCw,
  Key,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'halls', 'departments', 'bookings', 'reports'
  const { lastUpdate } = useSocket();

  // Data states
  const [stats, setStats] = useState(null);
  const [halls, setHalls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [showHallModal, setShowHallModal] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [hallForm, setHallForm] = useState({
    hall_code: '',
    hall_name: '',
    hall_type: 'Seminar Hall',
    capacity: 100,
    location: '',
    facilities: '',
    status: 'active'
  });

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    department_code: '',
    department_name: '',
    password: '',
    status: 'active'
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [alertMsg, setAlertMsg] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, hallsRes, deptsRes, bookingsRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/halls'),
        api.get('/departments'),
        api.get('/bookings')
      ]);

      setStats(statsRes.data);
      setHalls(hallsRes.data);
      setDepartments(deptsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (lastUpdate) {
      fetchAdminData();
    }
  }, [lastUpdate]);

  // Hall Handlers
  const handleSaveHall = async (e) => {
    e.preventDefault();
    try {
      if (editingHall) {
        await api.put(`/halls/${editingHall.id}`, hallForm);
        setAlertMsg({ type: 'success', text: 'Hall updated successfully!' });
      } else {
        await api.post('/halls', hallForm);
        setAlertMsg({ type: 'success', text: 'New hall added successfully!' });
      }
      setShowHallModal(false);
      setEditingHall(null);
      fetchAdminData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save hall' });
    }
  };

  const handleDeleteHall = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete hall "${name}"?`)) return;
    try {
      await api.delete(`/halls/${id}`);
      setAlertMsg({ type: 'success', text: `Hall "${name}" deleted.` });
      fetchAdminData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete hall' });
    }
  };

  // Dept Handlers
  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, deptForm);
        setAlertMsg({ type: 'success', text: 'Department updated successfully!' });
      } else {
        await api.post('/departments', deptForm);
        setAlertMsg({ type: 'success', text: 'New department created successfully!' });
      }
      setShowDeptModal(false);
      setEditingDept(null);
      fetchAdminData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save department' });
    }
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) return;
    try {
      await api.delete(`/departments/${id}`);
      setAlertMsg({ type: 'success', text: `Department "${name}" deleted.` });
      fetchAdminData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete department' });
    }
  };

  // Booking Handlers
  const handleUpdateBookingStatus = async (id, newStatus) => {
    try {
      await api.put(`/bookings/${id}`, { status: newStatus });
      setAlertMsg({ type: 'success', text: `Booking status changed to ${newStatus}.` });
      fetchAdminData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update status' });
    }
  };

  // PDF Export
  const exportPDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('CAMPUS HALL BOOKING REGISTER REPORT', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ['ID', 'Date', 'Time', 'Hall', 'Event', 'Department', 'Organizer & Designation', 'Status'];
    const tableRows = bookings.map(b => [
      b.id,
      b.event_date,
      `${b.start_time}-${b.end_time}`,
      b.hall_name,
      b.event_name,
      b.department_code,
      `${b.organizer_name} (${b.organizer_designation || 'Faculty'})`,
      b.status
    ]);

    autoTable(doc, {
      startY: 34,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] }
    });

    doc.save(`college_hall_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // CSV Export
  const exportCSVReport = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      b.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hall_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Control Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Campus Hall System Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure departments, halls, credentials, booking approvals, and export registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Data
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
          alertMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div>{alertMsg.text}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'System Overview', icon: ShieldCheck },
          { id: 'halls', label: 'Manage Halls', icon: Building2 },
          { id: 'departments', label: 'Manage Departments', icon: Users },
          { id: 'bookings', label: 'All Bookings', icon: Calendar },
          { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card3D glowColor="blue" className="border-l-4 border-l-blue-500 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Halls</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalHalls || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{stats?.auditoriums || 0} Audi / {stats?.seminarHalls || 0} Seminar</p>
            </Card3D>

            <Card3D glowColor="purple" className="border-l-4 border-l-purple-500 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Departments</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{stats?.totalDepartments || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Active college accounts</p>
            </Card3D>

            <div onClick={() => { setActiveTab('bookings'); setStatusFilter('pending'); }}>
              <Card3D glowColor="gold" className="border-l-4 border-l-amber-500 p-5 cursor-pointer">
                <p className="text-xs font-semibold text-slate-400 uppercase flex items-center justify-between">
                  <span>Pending Approvals</span>
                  {bookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">
                  {bookings.filter(b => b.status === 'pending').length}
                </h3>
                <p className="text-[11px] text-amber-500/80 mt-1">Click to review & approve</p>
              </Card3D>
            </div>

            <Card3D glowColor="emerald" className="border-l-4 border-l-emerald-500 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase">Today's Bookings</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats?.todayEvents || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{stats?.occupiedNow || 0} currently live</p>
            </Card3D>

            <Card3D glowColor="rose" className="border-l-4 border-l-rose-500 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase">Cancelled Bookings</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats?.cancelledBookings || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-1">System wide total</p>
            </Card3D>
          </div>

          {/* Active Events Live Monitor */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Radio className="w-5 h-5 text-rose-400 animate-pulse" /> Active Events In Progress Right Now
            </h3>

            {stats?.activeEvents?.length === 0 ? (
              <p className="text-xs text-slate-400">No active events currently running.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.activeEvents?.map(ev => (
                  <div key={ev.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                      <span>{ev.hall_name} ({ev.hall_type})</span>
                      <span>{ev.start_time} - {ev.end_time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{ev.event_name}</h4>
                    <p className="text-xs text-slate-400">Dept: <strong className="text-blue-300">{ev.department_code}</strong> • {ev.participants} guests</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE HALLS */}
      {activeTab === 'halls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Campus Halls Register</h3>
            <button
              onClick={() => {
                setEditingHall(null);
                setHallForm({
                  hall_code: '',
                  hall_name: '',
                  hall_type: 'Seminar Hall',
                  capacity: 100,
                  location: '',
                  facilities: '',
                  status: 'active'
                });
                setShowHallModal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Hall
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map(h => (
              <div key={h.id} className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {h.hall_code}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-1">{h.hall_name}</h4>
                    <p className="text-xs text-slate-400">{h.location}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    h.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {h.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl space-y-1">
                  <div>Type: <strong className="text-white">{h.hall_type}</strong></div>
                  <div>Capacity: <strong className="text-indigo-400">{h.capacity} seats</strong></div>
                  <div className="text-slate-400 truncate">Facilities: {h.facilities || 'Standard'}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingHall(h);
                      setHallForm(h);
                      setShowHallModal(true);
                    }}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg text-xs flex items-center gap-1 font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteHall(h.id, h.hall_name)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">College Departments Credentials</h3>
            <button
              onClick={() => {
                setEditingDept(null);
                setDeptForm({ department_code: '', department_name: '', password: '', status: 'active' });
                setShowDeptModal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Department ID
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Department ID</th>
                  <th className="p-3.5">Department Name</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {departments.map(d => (
                  <tr key={d.id} className="hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold font-mono text-indigo-400">{d.department_code}</td>
                    <td className="p-3.5 font-semibold text-white">{d.department_name}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        d.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingDept(d);
                          setDeptForm({ ...d, password: '' });
                          setShowDeptModal(true);
                        }}
                        className="px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg font-semibold"
                      >
                        Edit / Reset Pass
                      </button>
                      <button
                        onClick={() => handleDeleteDept(d.id, d.department_name)}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 text-sm text-white rounded-lg border border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {['ALL', 'pending', 'confirmed', 'rejected', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize flex items-center gap-1.5 whitespace-nowrap ${
                    statusFilter === st ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                  {st === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                      {bookings.filter(b => b.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Event Title</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Hall</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-900/50">
                      <td className="p-3.5 font-mono text-xs text-slate-400">#{b.id}</td>
                      <td className="p-3.5 font-bold text-white">{b.event_name}</td>
                      <td className="p-3.5 font-semibold text-indigo-400">{b.department_code}</td>
                      <td className="p-3.5 text-slate-200">{b.hall_name}</td>
                      <td className="p-3.5 font-mono text-xs text-amber-400">{b.event_date} ({b.start_time}-{b.end_time})</td>
                      <td className="p-3.5 whitespace-nowrap">
                        {b.status === 'confirmed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                        {b.status === 'pending' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        )}
                        {b.status === 'rejected' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              className="px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-md inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                              className="px-3 py-1.5 text-xs text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg font-semibold border border-rose-500/30 inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                            className="px-2.5 py-1 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg font-semibold"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & EXPORTS */}
      {activeTab === 'reports' && (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Generate Campus Booking Reports</h3>
            <p className="text-xs text-slate-400 mt-1">Download official hall utilization registers in PDF or CSV formats.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={exportPDFReport}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Download PDF Register
            </button>

            <button
              onClick={exportCSVReport}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download CSV Spreadsheet
            </button>
          </div>
        </div>
      )}

      {/* Modal for Adding/Editing Hall */}
      {showHallModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveHall} className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingHall ? 'Edit Hall' : 'Add New Hall'}</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Hall Code *</label>
              <input
                type="text"
                placeholder="e.g. AUDI02"
                value={hallForm.hall_code}
                onChange={(e) => setHallForm({ ...hallForm, hall_code: e.target.value })}
                required
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Hall Name *</label>
              <input
                type="text"
                placeholder="e.g. Science Auditorium"
                value={hallForm.hall_name}
                onChange={(e) => setHallForm({ ...hallForm, hall_name: e.target.value })}
                required
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Hall Type *</label>
                <select
                  value={hallForm.hall_type}
                  onChange={(e) => setHallForm({ ...hallForm, hall_type: e.target.value })}
                  className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
                >
                  <option value="Auditorium">Auditorium</option>
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Conference Hall">Conference Hall</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Capacity Seats *</label>
                <input
                  type="number"
                  value={hallForm.capacity}
                  onChange={(e) => setHallForm({ ...hallForm, capacity: parseInt(e.target.value, 10) })}
                  required
                  min="1"
                  className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Location / Block *</label>
              <input
                type="text"
                placeholder="e.g. Tech Block 3rd Floor"
                value={hallForm.location}
                onChange={(e) => setHallForm({ ...hallForm, location: e.target.value })}
                required
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Facilities</label>
              <input
                type="text"
                placeholder="e.g. Projector, AC, Sound system"
                value={hallForm.facilities}
                onChange={(e) => setHallForm({ ...hallForm, facilities: e.target.value })}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowHallModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-900 rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl">Save Hall</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal for Department Management */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveDept} className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingDept ? 'Edit Department' : 'Create Department Account'}</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Department Code (ID) *</label>
              <input
                type="text"
                placeholder="e.g. CSE001"
                value={deptForm.department_code}
                onChange={(e) => setDeptForm({ ...deptForm, department_code: e.target.value })}
                required
                disabled={!!editingDept}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Department Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Department of Computer Science & Engineering"
                value={deptForm.department_name}
                onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
                required
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">{editingDept ? 'Reset Password (leave blank to keep current)' : 'Account Password *'}</label>
              <input
                type="password"
                placeholder="Password"
                value={deptForm.password}
                onChange={(e) => setDeptForm({ ...deptForm, password: e.target.value })}
                required={!editingDept}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-900 rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl">Save Department</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
