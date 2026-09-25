import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  History,
  Calendar,
  Clock,
  Building2,
  Users,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Phone,
  LayoutGrid,
  List,
  RefreshCw,
  Award
} from 'lucide-react';

export default function PastEvents() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0, totalHours: '0.0' });
  const [loading, setLoading] = useState(true);
  const [halls, setHalls] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedHall, setSelectedHall] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const eventTypes = [
    'Seminar',
    'Workshop',
    'Conference',
    'Guest Lecture',
    'Cultural Event',
    'Technical Event',
    'Meeting',
    'Examination',
    'FDP',
    'Project Presentation'
  ];

  useEffect(() => {
    fetchMetadata();
    fetchPastEvents();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [hallsRes, deptsRes] = await Promise.all([
        api.get('/halls'),
        api.get('/departments')
      ]);
      setHalls(hallsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const fetchPastEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (selectedHall) params.append('hall_id', selectedHall);
      if (selectedDept) params.append('department_id', selectedDept);
      if (selectedType) params.append('event_type', selectedType);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/reports/past-events?${params.toString()}`);
      setEvents(res.data.events || []);
      setStats(res.data.stats || { totalEvents: 0, totalAttendees: 0, totalHours: '0.0' });
    } catch (err) {
      console.error('Failed to fetch past events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (e) => {
    e.preventDefault();
    fetchPastEvents();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedHall('');
    setSelectedDept('');
    setSelectedType('');
    setSearchTerm('');
    setTimeout(() => {
      api.get('/reports/past-events').then(res => {
        setEvents(res.data.events || []);
        setStats(res.data.stats || { totalEvents: 0, totalAttendees: 0, totalHours: '0.0' });
      });
    }, 50);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    params.append('past_only', 'true');
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (selectedHall) params.append('hall_id', selectedHall);
    if (selectedDept) params.append('department_id', selectedDept);

    window.open(`${api.defaults.baseURL}/reports/export/csv?${params.toString()}`, '_blank');
  };

  // Export PDF Report using jsPDF + AutoTable
  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');

    // Title Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('CENTRALIZED COLLEGE CONFERENCE HALL & AUDITORIUM SYSTEM', 14, 18);

    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Official Register of Past & Completed Events', 14, 26);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated on: ${dateStr} | Total Events: ${stats.totalEvents} | Total Attendees: ${stats.totalAttendees} | Hall Usage: ${stats.totalHours} hrs`, 14, 32);

    // Table Columns & Data
    const tableColumn = [
      '#', 'Event Title', 'Event Type', 'Department', 'Venue / Hall',
      'Date', 'Timing', 'Attendees', 'Organizer', 'Designation', 'Contact'
    ];

    const tableRows = events.map((item, index) => [
      index + 1,
      item.event_name,
      item.event_type,
      item.department_code || item.department_name,
      item.hall_name,
      item.event_date,
      `${item.start_time} - ${item.end_time}`,
      item.participants,
      item.organizer_name,
      item.organizer_designation || 'Faculty In-Charge',
      item.organizer_contact
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount} - Confidential College Event Register`, doc.internal.pageSize.width - 70, doc.internal.pageSize.height - 10);
    }

    doc.save(`College_Past_Events_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <History className="w-4 h-4" /> Historical Event Register & Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Past & Finished Events Archive
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Access completed auditorium seminars, workshops, and conference hall registers. View organizer designations and export official reports to PDF or CSV.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Download PDF Report
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV Register
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
            <div className="text-xs font-semibold text-slate-400">Total Finished Events</div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalEvents}</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
            <div className="text-xs font-semibold text-slate-400">Total Attendees</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{stats.totalAttendees.toLocaleString()}</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
            <div className="text-xs font-semibold text-slate-400">Total Hall Usage</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{stats.totalHours} hrs</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60">
            <div className="text-xs font-semibold text-slate-400">System Status</div>
            <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Real-time Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleFilterApply} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-400" /> Filter Finished Events
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Venue / Hall</label>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Halls</option>
              {halls.map(h => (
                <option key={h.id} value={h.id}>{h.hall_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.department_code}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Event Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Event Types</option>
              {eventTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title / Organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs rounded-xl p-2.5 pl-8 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" /> Apply Filter
          </button>
        </div>
      </form>

      {/* Events Rendering */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-semibold glass-panel rounded-2xl border border-slate-800">
          Loading past event registers...
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Finished Events Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try expanding your date range or clearing your filter criteria.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => (
            <div key={event.id} className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase tracking-wide">
                    {event.event_type}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Finished
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2">{event.event_name}</h3>
                {event.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Venue</span>
                    <span className="font-bold text-slate-200 block truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" /> {event.hall_name}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Department</span>
                    <span className="font-bold text-indigo-300 block truncate flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> {event.department_code}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Event Date</span>
                    <span className="font-bold text-slate-200 block flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> {event.event_date}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Time & Duration</span>
                    <span className="font-bold text-slate-200 block flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" /> {event.start_time} - {event.end_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizer Section */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">Organizer & Designation</span>
                  <span className="font-bold text-white block truncate flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> {event.organizer_name}
                  </span>
                  <span className="text-[10px] text-blue-400 font-semibold block truncate">
                    💼 {event.organizer_designation || 'Faculty In-Charge'}
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 block">
                    👥 {event.participants} Attendees
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    📞 {event.organizer_contact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tabular View */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <th className="p-3.5">#</th>
                <th className="p-3.5">Event Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Hall</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Timing</th>
                <th className="p-3.5">Organizer & Designation</th>
                <th className="p-3.5 text-right">Attendees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {events.map((event, idx) => (
                <tr key={event.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 text-slate-500 font-bold">{idx + 1}</td>
                  <td className="p-3.5 font-bold text-white max-w-xs truncate">
                    <div>{event.event_name}</div>
                    <span className="text-[10px] font-semibold text-blue-400">{event.event_type}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-indigo-300">{event.department_code}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{event.hall_name}</td>
                  <td className="p-3.5 font-semibold text-slate-300">{event.event_date}</td>
                  <td className="p-3.5 font-semibold text-amber-300">{event.start_time} - {event.end_time}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{event.organizer_name}</div>
                    <div className="text-[10px] text-blue-400 font-medium">{event.organizer_designation || 'Faculty In-Charge'}</div>
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-400">{event.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
