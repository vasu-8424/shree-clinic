import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../api/client';

interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  department: string;
  appointmentDate: string | null;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  healthConcern: string | null;
  source: string;
  createdAt: string;
  patient?: {
    id: string;
    uhid: string;
    fullName: string;
    phone: string;
  } | null;
}

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New appointment form state
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    department: 'AUDIOLOGY',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning (9:00 AM – 1:00 PM)',
    healthConcern: '',
    status: 'CONFIRMED',
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (deptFilter) params.append('department', deptFilter);
      if (search) params.append('search', search);

      const res = await apiFetch(`/api/v1/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAppointments();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, deptFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/appointments', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          patientName: '',
          phone: '',
          department: 'AUDIOLOGY',
          appointmentDate: new Date().toISOString().split('T')[0],
          timeSlot: 'Morning (9:00 AM – 1:00 PM)',
          healthConcern: '',
          status: 'CONFIRMED',
        });
        loadAppointments();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create appointment');
      }
    } catch (err) {
      alert('Error creating appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/v1/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadAppointments();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
      case 'AUDIOLOGY':
        return 'Audiology & Hearing';
      case 'SPEECH_THERAPY':
        return 'Speech Therapy';
      case 'PHYSIOTHERAPY':
        return 'Physiotherapy';
      case 'HEARING_AID':
        return 'Hearing Aids';
      default:
        return dept;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Intake
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-[#d9ae4a]" />
            Appointments Calendar & Queue
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage consultations, walk-in intakes, and scheduled patient sessions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#0b3037] hover:bg-[#124b55] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by patient name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (Web Intake)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Departments</option>
            <option value="AUDIOLOGY">Audiology & Hearing</option>
            <option value="SPEECH_THERAPY">Speech Therapy</option>
            <option value="PHYSIOTHERAPY">Physiotherapy</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#0b3037] animate-spin mb-3" />
            <p className="text-xs text-stone-500">Loading appointments queue...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No appointments found</h3>
            <p className="text-xs text-stone-500 mt-1">Book a new appointment or modify your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date & Time Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {apt.patientName}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {apt.phone}
                      </div>
                      {apt.healthConcern && (
                        <div className="text-[11px] text-stone-600 italic mt-1 line-clamp-1 max-w-xs">
                          "{apt.healthConcern}"
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-800 rounded-md font-medium text-xs">
                        {getDepartmentLabel(apt.department)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800">
                        {apt.appointmentDate
                          ? new Date(apt.appointmentDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Date TBD'}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(apt.status)}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] uppercase tracking-wider font-mono text-stone-500">
                        {apt.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-lg cursor-pointer transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Book Clinic Consultation
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Create a scheduled or walk-in appointment record.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="AUDIOLOGY">Audiology & Hearing</option>
                    <option value="SPEECH_THERAPY">Speech Therapy</option>
                    <option value="PHYSIOTHERAPY">Physiotherapy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Time Window</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="Morning (9:00 AM – 1:00 PM)">Morning (9:00 AM – 1:00 PM)</option>
                  <option value="Evening (4:00 PM – 8:00 PM)">Evening (4:00 PM – 8:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Health Concern / Notes</label>
                <textarea
                  rows={2}
                  value={formData.healthConcern}
                  onChange={(e) => setFormData({ ...formData, healthConcern: e.target.value })}
                  placeholder="Clinical concern or reason for visit..."
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
