import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  X,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const HearingAidsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'trials'>('enquiries');
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // New enquiry modal
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    source: 'Walk-in',
    notes: '',
  });

  // Start trial modal
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [trialForm, setTrialForm] = useState({
    patientId: '',
    inventoryId: '',
    earSide: 'BINAURAL',
    trialDays: 7,
    depositAmount: 0,
    feedback: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'enquiries') {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (search) params.append('search', search);
        const res = await apiFetch(`/api/v1/hearing-aids/enquiries?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setEnquiries(data.enquiries || []);
        }
      } else {
        const res = await apiFetch('/api/v1/hearing-aids/trials');
        if (res.ok) {
          const data = await res.json();
          setTrials(data.trials || []);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, search, statusFilter]);

  const loadDropdowns = async () => {
    try {
      const [patRes, invRes] = await Promise.all([
        apiFetch('/api/v1/patients?limit=50'),
        apiFetch('/api/v1/inventory?status=IN_STOCK'),
      ]);
      if (patRes.ok) {
        const pData = await patRes.json();
        setPatientsList(pData.data || pData.patients || []);
      }
      if (invRes.ok) {
        const iData = await invRes.json();
        setInventoryList(iData.items || []);
      }
    } catch (e) {
      console.error('Error loading dropdowns:', e);
    }
  };

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/hearing-aids/enquiries', {
        method: 'POST',
        body: JSON.stringify(enquiryForm),
      });
      if (res.ok) {
        setIsEnquiryModalOpen(false);
        setEnquiryForm({ name: '', phone: '', source: 'Walk-in', notes: '' });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create enquiry');
      }
    } catch {
      alert('Error saving enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/hearing-aids/trials', {
        method: 'POST',
        body: JSON.stringify(trialForm),
      });
      if (res.ok) {
        setIsTrialModalOpen(false);
        setTrialForm({
          patientId: '',
          inventoryId: '',
          earSide: 'BINAURAL',
          trialDays: 7,
          depositAmount: 0,
          feedback: '',
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to initiate trial');
      }
    } catch {
      alert('Error initiating trial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTrialOutcome = async (trialId: string, outcome: string) => {
    try {
      const res = await apiFetch(`/api/v1/hearing-aids/trials/${trialId}`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to update trial outcome:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
            <Headphones className="w-7 h-7 text-[#d9ae4a]" />
            Hearing Aid Enquiries, Trials & Dispensing
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track patient consultations, home evaluation trials, and device dispensing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'enquiries' ? (
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#0b3037] hover:bg-[#124b55] shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Enquiry</span>
            </button>
          ) : (
            <button
              onClick={() => {
                loadDropdowns();
                setIsTrialModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#0b3037] hover:bg-[#124b55] shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Patient Trial</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
        <button
          onClick={() => {
            setActiveTab('enquiries');
            setStatusFilter('');
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'enquiries'
              ? 'text-[#0b3037] border-b-2 border-[#0b3037] bg-white'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Enquiries & Leads ({enquiries.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('trials');
            setStatusFilter('');
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'trials'
              ? 'text-[#0b3037] border-b-2 border-[#0b3037] bg-white'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Patient Trials Tracker ({trials.length})
        </button>
      </div>

      {/* Search / Filter for enquiries */}
      {activeTab === 'enquiries' && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search enquiries by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open Enquiries</option>
            <option value="TRIAL_SCHEDULED">Trial Scheduled</option>
            <option value="CONVERTED">Purchased / Converted</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#0b3037] animate-spin mb-3" />
            <p className="text-xs text-stone-500">Loading records...</p>
          </div>
        ) : activeTab === 'enquiries' ? (
          enquiries.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-800">No enquiries found</h3>
              <p className="text-xs text-stone-500 mt-1">Record your first hearing aid enquiry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Lead Source</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Clinical Notes</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          {enq.name}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {enq.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">{enq.source}</td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {enq.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : trials.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No active trials recorded</h3>
            <p className="text-xs text-stone-500 mt-1">
              Select an in-stock hearing aid unit to initiate a patient trial.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Device Model & Serial</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Trial Period</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {trials.map((tr) => (
                  <tr key={tr.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{tr.patient?.fullName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{tr.patient?.uhid}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">
                        {tr.inventory?.brand} {tr.inventory?.modelName}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        S/N: {tr.inventory?.serialNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-stone-100 font-medium">
                        {tr.earSide}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-800 font-medium">
                        {new Date(tr.trialStartDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        –{' '}
                        {new Date(tr.trialEndDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-800">
                      ₹{Number(tr.depositAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tr.outcome === 'ONGOING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : tr.outcome === 'PURCHASED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {tr.outcome}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {tr.outcome === 'ONGOING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateTrialOutcome(tr.id, 'PURCHASED')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            Mark Sold
                          </button>
                          <button
                            onClick={() => handleUpdateTrialOutcome(tr.id, 'RETURNED')}
                            className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                          >
                            Returned
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Enquiry Modal */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsEnquiryModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Record Hearing Aid Enquiry
            </h2>
            <p className="text-xs text-stone-500 mb-6">Log incoming lead or walk-in consultation.</p>

            <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  placeholder="e.g. Anand Varma"
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Source</label>
                <select
                  value={enquiryForm.source}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, source: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="Walk-in">Walk-in Consultation</option>
                  <option value="Doctor Referral">Doctor Referral (Freedom Hospitals)</option>
                  <option value="Website">Website Intake</option>
                  <option value="Phone Call">Direct Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Clinical / Device Notes</label>
                <textarea
                  rows={3}
                  value={enquiryForm.notes}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
                  placeholder="Preferred brand, hearing loss severity, rechargeable requirement..."
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Initiate Trial Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsTrialModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Initiate Patient Trial
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Assign an available in-stock hearing aid unit to a patient.
            </p>

            <form onSubmit={handleCreateTrial} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Select Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={trialForm.patientId}
                  onChange={(e) => setTrialForm({ ...trialForm, patientId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Select Available In-Stock Device <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={trialForm.inventoryId}
                  onChange={(e) => setTrialForm({ ...trialForm, inventoryId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Choose In-Stock Device --</option>
                  {inventoryList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.brand} {inv.modelName} (S/N: {inv.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ear Side</label>
                  <select
                    value={trialForm.earSide}
                    onChange={(e) => setTrialForm({ ...trialForm, earSide: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="BINAURAL">Binaural (Both Ears)</option>
                    <option value="RIGHT">Right Ear</option>
                    <option value="LEFT">Left Ear</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Trial Days</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={trialForm.trialDays}
                    onChange={(e) =>
                      setTrialForm({ ...trialForm, trialDays: parseInt(e.target.value) || 7 })
                    }
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={trialForm.depositAmount}
                  onChange={(e) =>
                    setTrialForm({ ...trialForm, depositAmount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTrialModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Start Patient Trial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
