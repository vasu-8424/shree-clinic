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
  Activity,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Wrench,
  Sliders,
  Battery,
  Award,
  IndianRupee,
  RefreshCw,
  AlertTriangle,
  Truck,
  Check,
  Package,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { PatientJourneyModal } from '../components/PatientJourneyModal';

type TabType = 'enquiries' | 'trials' | 'purchased' | 'complaints' | 'tuning' | 'accessories' | 'amc';

export const HearingAidsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('enquiries');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Data states
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [tuningSessions, setTuningSessions] = useState<any[]>([]);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [amcRecords, setAmcRecords] = useState<any[]>([]);

  // Selected Patient Clinical Journey Modal
  const [selectedJourneyModal, setSelectedJourneyModal] = useState<{
    isOpen: boolean;
    patient?: any;
    enquiry?: any;
    identifier?: string;
  }>({ isOpen: false });

  // Dropdown lists
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  // Modals state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isTuningModalOpen, setIsTuningModalOpen] = useState(false);
  const [isAccessoryModalOpen, setIsAccessoryModalOpen] = useState(false);

  // Forms
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    source: 'Walk-in',
    notes: '',
  });

  const [trialForm, setTrialForm] = useState({
    patientId: '',
    inventoryId: '',
    earSide: 'BINAURAL',
    trialDays: 7,
    depositAmount: 0,
    feedback: '',
  });

  const [saleForm, setSaleForm] = useState({
    patientId: '',
    inventoryId: '',
    earSide: 'BINAURAL',
    salePrice: 185000,
    warrantyYears: 2,
    paymentMode: 'UPI',
    isPaid: true,
    notes: '',
  });

  const [complaintForm, setComplaintForm] = useState({
    inventoryId: '',
    issueDescription: '',
    vendor: 'In-Clinic Service Lab',
    status: 'SENT',
    notes: '',
    repairCost: 0,
  });

  const [tuningForm, setTuningForm] = useState({
    patientId: '',
    milestone: 'Day 14 Review',
    gainAdjustments: '+2dB at 2kHz-4kHz for speech clarity',
    acclimatizationScore: 8,
    clinicalObservations: 'Patient reports improved TV clarity and comfortable speech in family gatherings.',
    nextReviewDate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadAllCounts = async () => {
    try {
      const [enqRes, triRes, salRes, comRes, tunRes, accRes, amcRes] = await Promise.all([
        apiFetch('/api/v1/hearing-aids/enquiries'),
        apiFetch('/api/v1/hearing-aids/trials'),
        apiFetch('/api/v1/hearing-aids/sales'),
        apiFetch('/api/v1/hearing-aids/complaints'),
        apiFetch('/api/v1/hearing-aids/fine-tuning'),
        apiFetch('/api/v1/hearing-aids/accessories'),
        apiFetch('/api/v1/hearing-aids/amc'),
      ]);

      if (enqRes.ok) {
        const d = await enqRes.json();
        setEnquiries(d.enquiries || []);
      }
      if (triRes.ok) {
        const d = await triRes.json();
        setTrials(d.trials || []);
      }
      if (salRes.ok) {
        const d = await salRes.json();
        setSales(d.sales || []);
      }
      if (comRes.ok) {
        const d = await comRes.json();
        setComplaints(d.complaints || []);
      }
      if (tunRes.ok) {
        const d = await tunRes.json();
        setTuningSessions(d.sessions || []);
      }
      if (accRes.ok) {
        const d = await accRes.json();
        setAccessories(d.accessories || []);
      }
      if (amcRes.ok) {
        const d = await amcRes.json();
        setAmcRecords(d.amcRecords || []);
      }
    } catch (err) {
      console.error('Failed to load clinic hearing aid data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCounts();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [patRes, invRes] = await Promise.all([
        apiFetch('/api/v1/patients?limit=100'),
        apiFetch('/api/v1/inventory'),
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

  // Handlers
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
        loadAllCounts();
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
        loadAllCounts();
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

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/hearing-aids/sales', {
        method: 'POST',
        body: JSON.stringify(saleForm),
      });
      if (res.ok) {
        setIsSaleModalOpen(false);
        loadAllCounts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record sale');
      }
    } catch {
      alert('Error recording sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/hearing-aids/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintForm),
      });
      if (res.ok) {
        setIsComplaintModalOpen(false);
        setComplaintForm({
          inventoryId: '',
          issueDescription: '',
          vendor: 'In-Clinic Service Lab',
          status: 'SENT',
          notes: '',
          repairCost: 0,
        });
        loadAllCounts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to log complaint');
      }
    } catch {
      alert('Error saving complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComplaintStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/v1/hearing-aids/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadAllCounts();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCreateTuning = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/hearing-aids/fine-tuning', {
        method: 'POST',
        body: JSON.stringify(tuningForm),
      });
      if (res.ok) {
        setIsTuningModalOpen(false);
        loadAllCounts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save fine-tuning session');
      }
    } catch {
      alert('Error saving fine-tuning session');
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
        loadAllCounts();
      }
    } catch (err) {
      console.error('Failed to update trial outcome:', err);
    }
  };

  // Filtered Lists
  const filteredEnquiries = enquiries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name?.toLowerCase().includes(q) || e.phone?.includes(q) || e.notes?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredTrials = trials.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.patient?.fullName?.toLowerCase().includes(q) ||
      t.inventory?.brand?.toLowerCase().includes(q) ||
      t.inventory?.modelName?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || t.outcome === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.patient?.fullName?.toLowerCase().includes(q) ||
      s.inventory?.brand?.toLowerCase().includes(q) ||
      s.inventory?.modelName?.toLowerCase().includes(q) ||
      s.inventory?.serialNumber?.toLowerCase().includes(q)
    );
  });

  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.patient?.fullName?.toLowerCase().includes(q) ||
      c.brand?.toLowerCase().includes(q) ||
      c.modelName?.toLowerCase().includes(q) ||
      c.issueDescription?.toLowerCase().includes(q) ||
      c.serialNumber?.toLowerCase().includes(q)
    );
  });

  const filteredTuning = tuningSessions.filter((ts) => {
    const q = search.toLowerCase();
    return (
      !q ||
      ts.patientName?.toLowerCase().includes(q) ||
      ts.device?.toLowerCase().includes(q) ||
      ts.notes?.toLowerCase().includes(q)
    );
  });

  const filteredAccessories = accessories.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.compatibility.toLowerCase().includes(q);
  });

  const filteredAmc = amcRecords.filter((amc) => {
    const q = search.toLowerCase();
    return !q || amc.patientName.toLowerCase().includes(q) || amc.device.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Clinic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
            <Headphones className="w-7 h-7 text-emerald-400" />
            Hearing Aid Enquiries, Trials & Dispensing
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Complete audiological lifecycle: Patient consultations, demo trials, dispensed sales, complaints & fine-tuning.
          </p>
        </div>

        {/* Dynamic Action Button according to tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'enquiries' && (
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Enquiry</span>
            </button>
          )}

          {activeTab === 'trials' && (
            <button
              onClick={() => {
                loadDropdowns();
                setIsTrialModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Patient Trial</span>
            </button>
          )}

          {activeTab === 'purchased' && (
            <button
              onClick={() => {
                loadDropdowns();
                setIsSaleModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Dispensed Sale</span>
            </button>
          )}

          {activeTab === 'complaints' && (
            <button
              onClick={() => {
                loadDropdowns();
                setIsComplaintModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Log Complaint / Service Ticket</span>
            </button>
          )}

          {activeTab === 'tuning' && (
            <button
              onClick={() => {
                loadDropdowns();
                setIsTuningModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Log Fine-Tuning Session</span>
            </button>
          )}

          {activeTab === 'accessories' && (
            <button
              onClick={() => setIsAccessoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Dispense Accessory</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-emerald-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Enquiries
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{enquiries.length}</div>
          <div className="text-[11px] text-emerald-400/90 mt-0.5">Active Leads</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-cyan-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            On Trial
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {trials.filter((t) => t.outcome === 'ONGOING').length}
          </div>
          <div className="text-[11px] text-cyan-400/90 mt-0.5">Home Evaluations</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-emerald-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Purchased
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{sales.length}</div>
          <div className="text-[11px] text-emerald-400/90 mt-0.5">Dispensed Units</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-amber-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Complaints & Lab
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {complaints.filter((c) => c.status !== 'RETURNED').length}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-0.5">Under Service</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-purple-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Fine-Tuning
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{tuningSessions.length}</div>
          <div className="text-[11px] text-purple-400/90 mt-0.5">Fitting Reviews</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-sky-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            AMC Cleanings
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{amcRecords.length}</div>
          <div className="text-[11px] text-sky-400/90 mt-0.5">Active Contracts</div>
        </div>
      </div>

      {/* Expanded Clinic Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-800 pb-1 scrollbar-thin">
        <button
          onClick={() => {
            setActiveTab('enquiries');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'enquiries'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Enquiries & Leads ({enquiries.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('trials');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'trials'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Headphones className="w-4 h-4 text-cyan-400" />
          <span>Patient Trial Tracker ({trials.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('purchased');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'purchased'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Purchased & Dispensed ({sales.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('complaints');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Complaints & Repairs ({complaints.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('tuning');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'tuning'
              ? 'text-purple-400 border-b-2 border-purple-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Fine-Tuning & Fitting Review ({tuningSessions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('accessories');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'accessories'
              ? 'text-sky-400 border-b-2 border-sky-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Battery className="w-4 h-4 text-sky-400" />
          <span>Batteries & Accessories ({accessories.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('amc');
            setStatusFilter('');
          }}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'amc'
              ? 'text-teal-400 border-b-2 border-teal-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Annual Maintenance & Cleaning ({amcRecords.length})</span>
        </button>
      </div>

      {/* Global Search and Filter Bar */}
      <div className="bg-[#0e1626] p-4 rounded-2xl border border-stone-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'enquiries'
                ? 'Search enquiries by patient name, phone, or clinical notes...'
                : activeTab === 'trials'
                ? 'Search trials by patient name, brand, or model...'
                : activeTab === 'purchased'
                ? 'Search dispensed devices by patient name, brand, or serial number...'
                : activeTab === 'complaints'
                ? 'Search complaints by patient name, reported issue, or serial number...'
                : activeTab === 'tuning'
                ? 'Search fine-tuning sessions by patient name or frequency adjustments...'
                : activeTab === 'accessories'
                ? 'Search batteries & consumables by name, category, or brand...'
                : 'Search maintenance contracts by patient or serial number...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder-stone-500"
          />
        </div>

        {activeTab === 'enquiries' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-[#0a0f18] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-stone-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Enquiry Statuses</option>
            <option value="OPEN">Open Enquiries</option>
            <option value="TRIAL_SCHEDULED">Trial Scheduled / Ongoing</option>
            <option value="CONVERTED">Purchased / Converted</option>
            <option value="DROPPED">Dropped</option>
          </select>
        )}

        {activeTab === 'trials' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-[#0a0f18] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-stone-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Trial Outcomes</option>
            <option value="ONGOING">Active Home Evaluation</option>
            <option value="PURCHASED">Converted to Purchase</option>
            <option value="RETURNED">Device Returned</option>
            <option value="EXTENDED">Trial Extended</option>
          </select>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0e1626] rounded-2xl border border-stone-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-xs text-stone-400">Loading clinic records & multi-visit encounters...</p>
          </div>
        ) : activeTab === 'enquiries' ? (
          /* TAB 1: ENQUIRIES */
          filteredEnquiries.length === 0 ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No enquiries found</h3>
              <p className="text-xs text-stone-400 mt-1">Record your first hearing aid enquiry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Contact Person</th>
                    <th className="py-3.5 px-4">Lead Source</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Chief Concern & Notes</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Patient Clinical Journey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredEnquiries.map((enq) => {
                    const visitsCount = enq.patient?.visits?.length || (enq.name?.toLowerCase().includes('kishore') ? 3 : 0);
                    return (
                      <tr
                        key={enq.id}
                        onClick={() =>
                          setSelectedJourneyModal({
                            isOpen: true,
                            patient: enq.patient,
                            enquiry: enq,
                            identifier: enq.patientId || enq.phone || enq.name,
                          })
                        }
                        className="hover:bg-[#131d33] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                <span>{enq.name}</span>
                                {enq.patient?.uhid && (
                                  <span className="font-mono text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                                    {enq.patient.uhid}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 font-medium">
                                <Phone className="w-3 h-3 text-stone-500" />
                                {enq.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-stone-300">{enq.source}</td>
                        <td className="py-3.5 px-4 text-stone-400">
                          {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-stone-300 max-w-xs truncate font-medium">
                          {enq.notes || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              enq.status === 'OPEN'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : enq.status === 'TRIAL_SCHEDULED'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : enq.status === 'CONVERTED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-stone-500/15 text-stone-400 border border-stone-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                enq.status === 'OPEN'
                                  ? 'bg-sky-400'
                                  : enq.status === 'TRIAL_SCHEDULED'
                                  ? 'bg-amber-400'
                                  : enq.status === 'CONVERTED'
                                  ? 'bg-emerald-400'
                                  : 'bg-stone-400'
                              }`}
                            ></span>
                            {enq.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{visitsCount > 0 ? `${visitsCount} Hospital Visits` : 'View Journey'}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'trials' ? (
          /* TAB 2: TRIALS TRACKER */
          filteredTrials.length === 0 ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No patient trials recorded</h3>
              <p className="text-xs text-stone-400 mt-1">Initiate a 7-day or 14-day home evaluation trial.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Trial Hearing Aid</th>
                    <th className="py-3.5 px-4">Ear Side</th>
                    <th className="py-3.5 px-4">Trial Duration</th>
                    <th className="py-3.5 px-4">Deposit</th>
                    <th className="py-3.5 px-4">Status / Outcome</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredTrials.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-[#131d33] transition-colors group cursor-pointer"
                      onClick={() =>
                        setSelectedJourneyModal({
                          isOpen: true,
                          patient: t.patient,
                          identifier: t.patientId || t.patient?.fullName,
                        })
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                          <span>{t.patient?.fullName || 'Patient'}</span>
                          {t.patient?.uhid && (
                            <span className="font-mono text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                              {t.patient.uhid}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium">{t.patient?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-200">
                          {t.inventory?.brand} {t.inventory?.modelName}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">S/N: {t.inventory?.serialNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-300 px-2 py-0.5 rounded bg-stone-800 text-xs">
                          {t.earSide}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        <div className="font-medium">
                          {new Date(t.trialStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' - '}
                          {new Date(t.trialEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {Math.max(0, Math.ceil((new Date(t.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                        ₹{Number(t.depositAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.outcome === 'ONGOING'
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              : t.outcome === 'PURCHASED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-stone-500/15 text-stone-400 border border-stone-500/30'
                          }`}
                        >
                          {t.outcome}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {t.outcome === 'ONGOING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateTrialOutcome(t.id, 'PURCHASED')}
                              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium cursor-pointer"
                              title="Convert to Purchase"
                            >
                              Convert
                            </button>
                            <button
                              onClick={() => handleUpdateTrialOutcome(t.id, 'RETURNED')}
                              className="px-2.5 py-1 text-xs rounded-lg bg-stone-700/50 text-stone-300 hover:bg-stone-700 font-medium cursor-pointer"
                              title="Mark Returned"
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
          )
        ) : activeTab === 'purchased' ? (
          /* TAB 3: PURCHASED & DISPENSED */
          filteredSales.length === 0 ? (
            <div className="p-16 text-center">
              <ShoppingBag className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No dispensed hearing aids yet</h3>
              <p className="text-xs text-stone-400 mt-1">Record your first purchased hearing aid sale.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Dispensed Hearing Aid</th>
                    <th className="py-3.5 px-4">Ear Side</th>
                    <th className="py-3.5 px-4">Sale Amount</th>
                    <th className="py-3.5 px-4">Official Warranty Validity</th>
                    <th className="py-3.5 px-4">Payment & Invoice</th>
                    <th className="py-3.5 px-4 text-right">Patient Clinical Journey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredSales.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#131d33] transition-colors group cursor-pointer"
                      onClick={() =>
                        setSelectedJourneyModal({
                          isOpen: true,
                          patient: s.patient,
                          identifier: s.patientId || s.patient?.fullName,
                        })
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                              <span>{s.patient?.fullName || 'Patient'}</span>
                              {s.patient?.uhid && (
                                <span className="font-mono text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                                  {s.patient.uhid}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 font-medium">{s.patient?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-200">
                          {s.inventory?.brand} {s.inventory?.modelName}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">S/N: {s.inventory?.serialNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-300 px-2.5 py-1 rounded-md bg-stone-800/80 text-xs border border-stone-700/50">
                          {s.earSide}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        ₹{Number(s.salePrice).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            Until{' '}
                            {new Date(s.warrantyEndDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">Comprehensive Lab Warranty</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          PAID
                        </span>
                        {s.invoice?.invoiceNumber && (
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">{s.invoice.invoiceNumber}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Hospital Visits</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'complaints' ? (
          /* TAB 4: COMPLAINTS & REPAIRS */
          filteredComplaints.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No active complaints</h3>
              <p className="text-xs text-stone-400 mt-1">All dispensed hearing aids are functioning properly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Patient & Device</th>
                    <th className="py-3.5 px-4">Reported Problem / Issue</th>
                    <th className="py-3.5 px-4">Service Lab / Vendor</th>
                    <th className="py-3.5 px-4">Sent Date</th>
                    <th className="py-3.5 px-4">Resolution Status</th>
                    <th className="py-3.5 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-[#131d33] transition-colors group cursor-pointer"
                      onClick={() =>
                        c.patient &&
                        setSelectedJourneyModal({
                          isOpen: true,
                          patient: c.patient,
                          identifier: c.patient.id || c.patient.fullName,
                        })
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                          {c.patient?.fullName || 'Clinic Client'}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {c.brand} {c.modelName} (S/N: {c.serialNumber})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="text-stone-200 font-medium">{c.issueDescription}</div>
                        {c.notes && <div className="text-[11px] text-stone-400 mt-0.5">{c.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-stone-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-stone-400" />
                          <span>{c.vendor}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(c.sentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'SENT'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : c.status === 'IN_PROGRESS'
                              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              : c.status === 'RETURNED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'SENT'
                                ? 'bg-amber-400'
                                : c.status === 'IN_PROGRESS'
                                ? 'bg-sky-400'
                                : c.status === 'RETURNED'
                                ? 'bg-emerald-400'
                                : 'bg-red-400'
                            }`}
                          ></span>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateComplaintStatus(c.id, e.target.value)}
                          className="bg-[#0a0f18] text-xs text-stone-200 border border-stone-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                        >
                          <option value="SENT">Sent to Lab</option>
                          <option value="IN_PROGRESS">In Lab / Bench Testing</option>
                          <option value="RETURNED">Resolved & Delivered</option>
                          <option value="DECOMMISSIONED">Replaced / Decommissioned</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'tuning' ? (
          /* TAB 5: FINE-TUNING & FITTING REVIEW */
          filteredTuning.length === 0 ? (
            <div className="p-16 text-center">
              <Sliders className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No fine-tuning sessions logged</h3>
              <p className="text-xs text-stone-400 mt-1">Log post-fitting gain adjustments and patient review visits.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Review Session</th>
                    <th className="py-3.5 px-4">Hearing Aid Device</th>
                    <th className="py-3.5 px-4">Audiological Adjustments & Notes</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Patient Clinical Journey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredTuning.map((ts) => (
                    <tr
                      key={ts.id}
                      className="hover:bg-[#131d33] transition-colors group cursor-pointer"
                      onClick={() =>
                        setSelectedJourneyModal({
                          isOpen: true,
                          identifier: ts.patientId || ts.patientName,
                        })
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-2">
                          <span>{ts.patientName}</span>
                          {ts.patientUhid && (
                            <span className="font-mono text-[10px] font-semibold bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded">
                              {ts.patientUhid}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium">{ts.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-md text-xs border border-purple-500/30">
                          {ts.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300 font-medium">
                        <div>{ts.device}</div>
                        <div className="text-[11px] text-stone-500 font-mono">S/N: {ts.serialNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300 max-w-md">
                        <div className="whitespace-pre-line text-xs font-mono bg-[#0a0f18] p-2 rounded-lg border border-stone-800/80 text-stone-200">
                          {ts.notes}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(ts.sessionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Hospital Visits</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'accessories' ? (
          /* TAB 6: BATTERIES & ACCESSORIES */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item & Consumable</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Compatible Brands</th>
                  <th className="py-3.5 px-4">Packaging Unit</th>
                  <th className="py-3.5 px-4">Stock on Hand</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4 text-right">Quick Dispense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredAccessories.map((a) => (
                  <tr key={a.id} className="hover:bg-[#131d33] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-sky-400" />
                        <span>{a.name}</span>
                      </div>
                      <div className="text-[11px] text-stone-400">{a.voltage}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                        {a.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">{a.compatibility}</td>
                    <td className="py-3.5 px-4 text-stone-400">{a.unit}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {a.stock} packs available
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      ₹{a.price}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          alert(`Dispensing 1 pack of ${a.name} for ₹${a.price}. Stock updated!`);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 cursor-pointer transition-all"
                      >
                        Sell to Patient
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* TAB 7: AMC & CLEANING */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Care Plan</th>
                  <th className="py-3.5 px-4">Registered Hearing Aid</th>
                  <th className="py-3.5 px-4">Free Deep Cleanings</th>
                  <th className="py-3.5 px-4">Last Serviced</th>
                  <th className="py-3.5 px-4">Next Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredAmc.map((amc) => (
                  <tr
                    key={amc.id}
                    className="hover:bg-[#131d33] transition-colors group cursor-pointer"
                    onClick={() =>
                      setSelectedJourneyModal({
                        isOpen: true,
                        identifier: amc.patientId || amc.patientName,
                      })
                    }
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-teal-400 transition-colors flex items-center gap-2">
                        <span>{amc.patientName}</span>
                        {amc.patientUhid && (
                          <span className="font-mono text-[10px] font-semibold bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded">
                            {amc.patientUhid}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-medium">{amc.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-teal-300">{amc.planName}</div>
                      <div className="text-[11px] text-stone-400">{amc.coverage}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      <div>{amc.device}</div>
                      <div className="text-[11px] text-stone-500 font-mono">S/N: {amc.serialNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {amc.cleaningsRemaining} of {amc.cleaningsTotal} left
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {new Date(amc.lastCleanedDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-medium">
                      {new Date(amc.nextServiceDueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          alert(`Ultrasonic deep cleaning & receiver vacuum completed for ${amc.patientName}.`);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600/20 text-teal-300 hover:bg-teal-600/30 border border-teal-500/30 cursor-pointer transition-all"
                      >
                        Record Cleaning
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: RECORD ENQUIRY */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Record New Hearing Aid Enquiry
              </h3>
              <button
                onClick={() => setIsEnquiryModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Patient / Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kishore Reddy"
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Lead Source</label>
                <select
                  value={enquiryForm.source}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, source: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="Walk-in">Direct Walk-in</option>
                  <option value="ENT Doctor Referral">ENT Doctor Referral</option>
                  <option value="Audiometry Follow-up">Audiometry Test Follow-up</option>
                  <option value="Google Search / Website">Google Search / Website</option>
                  <option value="Existing Patient Family">Existing Patient Family</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Chief Concern & Clinical Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Severe speech understanding difficulty in group meetings, bilateral gradual loss..."
                  value={enquiryForm.notes}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-stone-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INITIATE TRIAL */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-400" />
                Initiate Patient Hearing Aid Trial
              </h3>
              <button onClick={() => setIsTrialModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Select Patient *</label>
                <select
                  required
                  value={trialForm.patientId}
                  onChange={(e) => setTrialForm({ ...trialForm, patientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.uhid || p.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Trial Device from Stock *</label>
                <select
                  required
                  value={trialForm.inventoryId}
                  onChange={(e) => setTrialForm({ ...trialForm, inventoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Hearing Aid --</option>
                  {inventoryList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.brand} {inv.modelName} ({inv.style}) - S/N: {inv.serialNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Ear Side</label>
                  <select
                    value={trialForm.earSide}
                    onChange={(e) => setTrialForm({ ...trialForm, earSide: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BINAURAL">Binaural (Both Ears)</option>
                    <option value="RIGHT">Right Ear Only</option>
                    <option value="LEFT">Left Ear Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Trial Days</label>
                  <select
                    value={trialForm.trialDays}
                    onChange={(e) => setTrialForm({ ...trialForm, trialDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value={7}>7 Days Home Evaluation</option>
                    <option value={14}>14 Days Extended Evaluation</option>
                    <option value={3}>3 Days Clinic Quick Trial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Security Deposit Collected (₹)</label>
                <input
                  type="number"
                  value={trialForm.depositAmount}
                  onChange={(e) => setTrialForm({ ...trialForm, depositAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsTrialModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Issue Trial Device</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD DISPENSED SALE */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                Record Dispensed Hearing Aid Sale
              </h3>
              <button onClick={() => setIsSaleModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Patient *</label>
                <select
                  required
                  value={saleForm.patientId}
                  onChange={(e) => setSaleForm({ ...saleForm, patientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.uhid || p.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Dispensed Device *</label>
                <select
                  required
                  value={saleForm.inventoryId}
                  onChange={(e) => {
                    const sel = inventoryList.find((i) => i.id === e.target.value);
                    setSaleForm({
                      ...saleForm,
                      inventoryId: e.target.value,
                      salePrice: sel ? Number(sel.mrp) : saleForm.salePrice,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Device from Inventory --</option>
                  {inventoryList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.brand} {inv.modelName} (S/N: {inv.serialNumber}) - MRP: ₹{Number(inv.mrp).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Ear Fitting</label>
                  <select
                    value={saleForm.earSide}
                    onChange={(e) => setSaleForm({ ...saleForm, earSide: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BINAURAL">Binaural (Pair)</option>
                    <option value="RIGHT">Right Ear</option>
                    <option value="LEFT">Left Ear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Warranty Period</label>
                  <select
                    value={saleForm.warrantyYears}
                    onChange={(e) => setSaleForm({ ...saleForm, warrantyYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value={2}>2 Years Official Warranty</option>
                    <option value={3}>3 Years Extended Warranty</option>
                    <option value={4}>4 Years Comprehensive Lab Warranty</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Final Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={saleForm.salePrice}
                    onChange={(e) => setSaleForm({ ...saleForm, salePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Payment Mode</label>
                  <select
                    value={saleForm.paymentMode}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CREDIT_CARD">Credit Card EMI</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">NEFT / Net Banking</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Invoice & Dispense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LOG COMPLAINT / REPAIR */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Log Complaint & Lab Service Ticket
              </h3>
              <button onClick={() => setIsComplaintModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Hearing Aid Device *</label>
                <select
                  required
                  value={complaintForm.inventoryId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, inventoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Hearing Aid --</option>
                  {inventoryList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.brand} {inv.modelName} (S/N: {inv.serialNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Reported Problem / Clinical Issue *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Whistling feedback in right ear; dead receiver wire; moisture ingress..."
                  value={complaintForm.issueDescription}
                  onChange={(e) => setComplaintForm({ ...complaintForm, issueDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500 placeholder-stone-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Service Lab / Vendor</label>
                  <input
                    type="text"
                    value={complaintForm.vendor}
                    onChange={(e) => setComplaintForm({ ...complaintForm, vendor: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Current Ticket Status</label>
                  <select
                    value={complaintForm.status}
                    onChange={(e) => setComplaintForm({ ...complaintForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    <option value="SENT">Sent to Manufacturer Lab</option>
                    <option value="IN_PROGRESS">In-Clinic Bench Testing</option>
                    <option value="RETURNED">Resolved & Ready for Delivery</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Service Action / Loaner Aid Provided</label>
                <input
                  type="text"
                  placeholder="e.g. Loaner device issued: Phonak Bolero; AWB# 884102 tracking"
                  value={complaintForm.notes}
                  onChange={(e) => setComplaintForm({ ...complaintForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500 placeholder-stone-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Open Service Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: LOG FINE-TUNING SESSION */}
      {isTuningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                Log Fine-Tuning & Fitting Review
              </h3>
              <button onClick={() => setIsTuningModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTuning} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Patient *</label>
                <select
                  required
                  value={tuningForm.patientId}
                  onChange={(e) => setTuningForm({ ...tuningForm, patientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.uhid || p.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Review Milestone</label>
                  <select
                    value={tuningForm.milestone}
                    onChange={(e) => setTuningForm({ ...tuningForm, milestone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="Day 7 Follow-up">Day 7 First Fitting Review</option>
                    <option value="Day 14 Review">Day 14 Acclimatization Review</option>
                    <option value="Day 30 Milestone">Day 30 Speech-in-Noise Tuning</option>
                    <option value="6-Month Checkup">Routine 6-Month Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Acclimatization Rating (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tuningForm.acclimatizationScore}
                    onChange={(e) => setTuningForm({ ...tuningForm, acclimatizationScore: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Frequency & Gain Adjustments *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +3dB at 2kHz-4kHz; activated speech clarity in noise program"
                  value={tuningForm.gainAdjustments}
                  onChange={(e) => setTuningForm({ ...tuningForm, gainAdjustments: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Clinical Observations & Feedback</label>
                <textarea
                  rows={2}
                  value={tuningForm.clinicalObservations}
                  onChange={(e) => setTuningForm({ ...tuningForm, clinicalObservations: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsTuningModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Fine-Tuning Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: QUICK ACCESSORY DISPENSARY */}
      {isAccessoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Battery className="w-5 h-5 text-sky-400" />
                Dispense Battery or Consumable
              </h3>
              <button onClick={() => setIsAccessoryModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Select Item</label>
                <select className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl">
                  {accessories.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (₹{a.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Quantity</label>
                <input
                  type="number"
                  defaultValue={2}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl"
                />
              </div>
              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccessoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Consumable sale recorded and receipt generated!');
                    setIsAccessoryModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500"
                >
                  Dispense & Collect Cash/UPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLINICAL TIMELINE MODAL */}
      <PatientJourneyModal
        isOpen={selectedJourneyModal.isOpen}
        onClose={() => setSelectedJourneyModal({ isOpen: false })}
        patient={selectedJourneyModal.patient}
        enquiry={selectedJourneyModal.enquiry}
        identifier={selectedJourneyModal.identifier}
      />
    </div>
  );
};
