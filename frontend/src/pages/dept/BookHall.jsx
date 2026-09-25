import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Send,
  Loader2
} from 'lucide-react';

export default function BookHall() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [halls, setHalls] = useState([]);
  const [loadingHalls, setLoadingHalls] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    hall_id: '',
    event_name: '',
    description: '',
    event_type: 'Seminar',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '12:00',
    participants: '',
    organizer_name: '',
    organizer_designation: 'Assistant Professor',
    custom_designation: '',
    organizer_contact: '',
    special_requirements: ''
  });

  // Conflict state
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

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
    'Project Presentation',
    'Other'
  ];

  useEffect(() => {
    api.get('/halls')
      .then(res => {
        const activeHalls = res.data.filter(h => h.status === 'active');
        setHalls(activeHalls);
        if (activeHalls.length > 0) {
          setFormData(prev => ({ ...prev, hall_id: activeHalls[0].id }));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingHalls(false));
  }, []);

  // Real-time conflict checking hook
  useEffect(() => {
    if (formData.hall_id && formData.event_date && formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        setConflictResult({ available: false, message: 'Start time must be before end time.' });
        return;
      }

      setCheckingConflict(true);
      const timer = setTimeout(() => {
        api.get(`/bookings/check-conflict?hall_id=${formData.hall_id}&event_date=${formData.event_date}&start_time=${formData.start_time}&end_time=${formData.end_time}`)
          .then(res => {
            setConflictResult(res.data);
          })
          .catch(err => {
            console.error(err);
          })
          .finally(() => {
            setCheckingConflict(false);
          });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [formData.hall_id, formData.event_date, formData.start_time, formData.end_time]);

  const selectedHallObj = halls.find(h => h.id === parseInt(formData.hall_id, 10));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    if (conflictResult && !conflictResult.available) {
      setAlertMsg({ type: 'error', text: conflictResult.message });
      return;
    }

    if (selectedHallObj && parseInt(formData.participants, 10) > selectedHallObj.capacity) {
      setAlertMsg({ type: 'error', text: `Participants (${formData.participants}) cannot exceed hall capacity (${selectedHallObj.capacity} seats).` });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        organizer_designation: formData.organizer_designation === 'Other' ? formData.custom_designation : formData.organizer_designation
      };
      const res = await api.post('/bookings', payload);
      setAlertMsg({ type: 'success', text: res.data.message || 'Booking request submitted! Waiting for Admin approval.' });
      setTimeout(() => {
        navigate('/dept/dashboard');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Booking failed. Please try again.';
      setAlertMsg({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" /> Department Booking Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Book a Campus Hall or Auditorium</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Log in as <strong className="text-blue-300">{user?.department_code}</strong> ({user?.department_name}). Real-time availability checks are active.
        </p>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
          alertMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <div>{alertMsg.text}</div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Step 1: Hall & Timing */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-5 h-5 text-blue-400" /> 1. Select Venue & Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Hall *</label>
              <select
                name="hall_id"
                value={formData.hall_id}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                {halls.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.hall_name} ({h.hall_type} - {h.capacity} seats)
                  </option>
                ))}
              </select>
              {selectedHallObj && (
                <p className="text-xs text-slate-400 mt-1">
                  📍 {selectedHallObj.location} • Max Capacity: <strong className="text-white">{selectedHallObj.capacity}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Date *</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time *</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Time *</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Real-time Conflict Banner */}
          <div className="mt-4">
            {checkingConflict ? (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying real-time venue availability...
              </div>
            ) : conflictResult ? (
              conflictResult.available ? (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Available: {conflictResult.message}</span>
                </div>
              ) : (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Conflict Detected:
                  </div>
                  <p className="text-rose-200 font-semibold">{conflictResult.message}</p>
                  {conflictResult.conflictingBooking && (
                    <p className="text-slate-400 text-[11px]">
                      Already booked by <strong>{conflictResult.conflictingBooking.department}</strong> for "{conflictResult.conflictingBooking.event_name}" ({conflictResult.conflictingBooking.start_time} - {conflictResult.conflictingBooking.end_time}).
                    </p>
                  )}
                </div>
              )
            ) : null}
          </div>
        </div>

        {/* Step 2: Event Details */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Info className="w-5 h-5 text-indigo-400" /> 2. Event Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Name / Title *</label>
              <input
                type="text"
                name="event_name"
                placeholder="e.g. National Conference on Machine Learning 2026"
                value={formData.event_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Type *</label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                {eventTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Participants *</label>
              <input
                type="number"
                name="participants"
                placeholder={`Max ${selectedHallObj?.capacity || 100}`}
                value={formData.participants}
                onChange={handleChange}
                required
                min="1"
                max={selectedHallObj?.capacity}
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Event Description</label>
              <textarea
                name="description"
                rows="2"
                placeholder="Brief summary of event objectives..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Step 3: Organizer & Reqs */}
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="w-5 h-5 text-amber-400" /> 3. Organizer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Faculty Organizer Name *</label>
              <input
                type="text"
                name="organizer_name"
                placeholder="e.g. Dr. A. Ramanathan"
                value={formData.organizer_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer Designation *</label>
              <select
                name="organizer_designation"
                value={formData.organizer_designation}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="Professor & Head (HOD)">Professor & Head (HOD)</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Department Event Coordinator">Department Event Coordinator</option>
                <option value="Placement In-Charge">Placement In-Charge</option>
                <option value="Student Coordinator">Student Coordinator</option>
                <option value="Technical Staff / In-Charge">Technical Staff / In-Charge</option>
                <option value="Dean / Director">Dean / Director</option>
                <option value="Other">Other (Custom Designation)</option>
              </select>
            </div>

            {formData.organizer_designation === 'Other' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-amber-300 mb-1">Specify Custom Designation *</label>
                <input
                  type="text"
                  name="custom_designation"
                  placeholder="e.g. Senior Research Fellow, Lab Assistant"
                  value={formData.custom_designation}
                  onChange={handleChange}
                  required={formData.organizer_designation === 'Other'}
                  className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-amber-500/50 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer Contact Number *</label>
              <input
                type="text"
                name="organizer_contact"
                placeholder="e.g. +91 98765 43210"
                value={formData.organizer_contact}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Requirements</label>
              <input
                type="text"
                name="special_requirements"
                placeholder="e.g. Stage podium mic, LAN cables, catering counter"
                value={formData.special_requirements}
                onChange={handleChange}
                className="w-full bg-slate-900 text-white text-sm rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dept/dashboard')}
            className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || (conflictResult && !conflictResult.available)}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Booking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Confirm Hall Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
