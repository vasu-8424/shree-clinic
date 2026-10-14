import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  History,
  FileText,
  Activity,
  Headphones,
  Receipt,
  Clock,
  X,
  CheckCircle2,
  Loader2,
  Lock,
  Plus,
  Printer,
  Wrench,
} from 'lucide-react';
import { apiFetch } from '../api/client';

// -------------------------------------------------------------
// EDIT PATIENT SCHEMA
// -------------------------------------------------------------
const editPatientSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().min(10, 'Valid phone required'),
  alternatePhone: z.string().trim().optional(),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  age: z.coerce.number().min(0).max(125).optional().nullable(),
  gender: z.string().optional(),
  address: z.string().trim().optional(),
  referralSource: z.string().trim().optional(),
  chiefComplaint: z.string().trim().min(2, 'Chief complaint required'),
  caseHistory: z.string().trim().optional(),
});

type EditPatientFormData = z.infer<typeof editPatientSchema>;

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'audiology' | 'hearing_aids' | 'therapy' | 'billing'>('overview');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  // Clinical Visit Modal
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitType: 'AUDIOLOGY',
    visitDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    plan: '',
    nextAppointmentDate: '',
  });

  // Audiogram Modal
  const [isAudiogramModalOpen, setIsAudiogramModalOpen] = useState(false);
  const [audiogramForm, setAudiogramForm] = useState({
    testDate: new Date().toISOString().split('T')[0],
    testType: 'Pure Tone Audiometry (PTA)',
    tympanometryLeft: 'Type A (Normal)',
    tympanometryRight: 'Type A (Normal)',
    interpretation: '',
    r250: 20, r500: 25, r1k: 25, r2k: 30, r4k: 40, r8k: 45,
    l250: 20, l500: 20, l1k: 25, l2k: 25, l4k: 35, l8k: 40,
  });

  // Hearing Aid Trial Modal
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [trialForm, setTrialForm] = useState({
    inventoryId: '',
    earSide: 'BINAURAL',
    trialDays: 7,
    depositAmount: 0,
    feedback: '',
  });

  // Therapy Plan Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    department: 'SPEECH_THERAPY',
    title: '',
    goals: '',
    homeProgram: '',
    targetDate: '',
  });

  // Therapy Session SOAP Modal
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({
    department: 'SPEECH_THERAPY',
    subjective: '',
    objective: '',
    assessment: '',
    planNext: '',
    vitalstimUsed: false,
    homeProgramAssigned: '',
  });

  // Patient Invoicing Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isGstApplied, setIsGstApplied] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([
    { description: 'Clinical Consultation & Diagnostic Assessment', hsnSac: '999312', quantity: 1, unitPrice: 1500 },
  ]);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; invoice: any | null }>({ open: false, invoice: null });
  const [quickPayAmount, setQuickPayAmount] = useState('');
  const [quickPayMode, setQuickPayMode] = useState('UPI');
  const [printableInvoice, setPrintableInvoice] = useState<any | null>(null);

  const [submittingAction, setSubmittingAction] = useState(false);

  // Permanent erase form state
  const [erasePassword, setErasePassword] = useState('');
  const [eraseConfirmText, setEraseConfirmText] = useState('');
  const [eraseError, setEraseError] = useState('');

  // Fetch Patient Details
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Patient not found');
        throw new Error('Failed to load patient profile');
      }
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: editErrors, isSubmitting: isEditing },
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  const handleOpenEdit = () => {
    if (data) {
      reset({
        fullName: data.fullName,
        phone: data.phone,
        alternatePhone: data.alternatePhone || '',
        email: data.email || '',
        age: data.age,
        gender: data.gender || '',
        address: data.address || '',
        referralSource: data.referralSource || '',
        chiefComplaint: data.chiefComplaint,
        caseHistory: data.caseHistory || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const editMutation = useMutation({
    mutationFn: async (formData: EditPatientFormData) => {
      const res = await apiFetch(`/api/v1/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update patient');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsEditModalOpen(false);
    },
  });

  // Soft Delete
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Archive failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/admin/patients');
    },
  });

  // Permanent Erase
  const handlePermanentErase = async () => {
    try {
      setEraseError('');
      const res = await apiFetch(`/api/v1/patients/${id}/erase`, {
        method: 'POST',
        body: JSON.stringify({
          adminPassword: erasePassword,
          confirmationText: eraseConfirmText,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setEraseError(err.error || 'Erasure failed');
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/admin/patients');
    } catch {
      setEraseError('Error communicating with erasure endpoint');
    }
  };

  // Withdraw Consent
  const withdrawConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}/consent/withdraw`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to record consent withdrawal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setIsWithdrawModalOpen(false);
    },
  });

  // Renew Consent
  const renewConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}/consent`, {
        method: 'POST',
        body: JSON.stringify({ consentVersion: '1.0', notes: 'Consent renewed by patient' }),
      });
      if (!res.ok) throw new Error('Failed to renew consent');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setIsRenewModalOpen(false);
    },
  });

  // Export JSON
  const handleExportData = async () => {
    try {
      const res = await apiFetch(`/api/v1/patients/${id}/data-export`);
      if (!res.ok) throw new Error('Data export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-export-${data?.uhid || id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // VISIT HANDLERS
  // -------------------------------------------------------------
  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const res = await apiFetch(`/api/v1/patients/${id}/visits`, {
        method: 'POST',
        body: JSON.stringify(visitForm),
      });
      if (res.ok) {
        setIsVisitModalOpen(false);
        setVisitForm({
          visitType: 'AUDIOLOGY',
          visitDate: new Date().toISOString().split('T')[0],
          diagnosis: '',
          notes: '',
          plan: '',
          nextAppointmentDate: '',
        });
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record visit');
      }
    } catch {
      alert('Error recording visit');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm('Are you sure you want to delete this clinical visit entry?')) return;
    try {
      const res = await apiFetch(`/api/v1/patients/${id}/visits/${visitId}`, { method: 'DELETE' });
      if (res.ok) refetch();
    } catch (e) {
      console.error('Failed to delete visit:', e);
    }
  };

  // -------------------------------------------------------------
  // AUDIOGRAM HANDLERS
  // -------------------------------------------------------------
  const handleCreateAudiogram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const frequencies = {
        right: {
          "250": audiogramForm.r250,
          "500": audiogramForm.r500,
          "1000": audiogramForm.r1k,
          "2000": audiogramForm.r2k,
          "4000": audiogramForm.r4k,
          "8000": audiogramForm.r8k,
        },
        left: {
          "250": audiogramForm.l250,
          "500": audiogramForm.l500,
          "1000": audiogramForm.l1k,
          "2000": audiogramForm.l2k,
          "4000": audiogramForm.l4k,
          "8000": audiogramForm.l8k,
        },
      };

      const res = await apiFetch(`/api/v1/patients/${id}/audiograms`, {
        method: 'POST',
        body: JSON.stringify({
          testDate: audiogramForm.testDate,
          testType: audiogramForm.testType,
          frequencies,
          tympanometryLeft: audiogramForm.tympanometryLeft,
          tympanometryRight: audiogramForm.tympanometryRight,
          interpretation: audiogramForm.interpretation,
        }),
      });

      if (res.ok) {
        setIsAudiogramModalOpen(false);
        setAudiogramForm({
          testDate: new Date().toISOString().split('T')[0],
          testType: 'Pure Tone Audiometry (PTA)',
          tympanometryLeft: 'Type A (Normal)',
          tympanometryRight: 'Type A (Normal)',
          interpretation: '',
          r250: 20, r500: 25, r1k: 25, r2k: 30, r4k: 40, r8k: 45,
          l250: 20, l500: 20, l1k: 25, l2k: 25, l4k: 35, l8k: 40,
        });
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record audiogram');
      }
    } catch {
      alert('Error recording audiogram');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteAudiogram = async (audiogramId: string) => {
    if (!confirm('Are you sure you want to remove this audiogram record?')) return;
    try {
      const res = await apiFetch(`/api/v1/patients/${id}/audiograms/${audiogramId}`, { method: 'DELETE' });
      if (res.ok) refetch();
    } catch (e) {
      console.error('Failed to delete audiogram:', e);
    }
  };

  // -------------------------------------------------------------
  // HEARING AID TRIAL HANDLERS
  // -------------------------------------------------------------
  const loadInStockDevices = async () => {
    try {
      const res = await apiFetch('/api/v1/inventory?status=IN_STOCK');
      if (res.ok) {
        const d = await res.json();
        setInventoryList(d.items || []);
      }
    } catch (e) {
      console.error('Failed to load inventory for trial:', e);
    }
  };

  const handleCreatePatientTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.inventoryId) {
      alert('Please select an in-stock hearing aid');
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await apiFetch('/api/v1/hearing-aids/trials', {
        method: 'POST',
        body: JSON.stringify({
          patientId: id,
          inventoryId: trialForm.inventoryId,
          earSide: trialForm.earSide,
          trialDays: trialForm.trialDays,
          depositAmount: trialForm.depositAmount,
          feedback: trialForm.feedback,
        }),
      });

      if (res.ok) {
        setIsTrialModalOpen(false);
        setTrialForm({
          inventoryId: '',
          earSide: 'BINAURAL',
          trialDays: 7,
          depositAmount: 0,
          feedback: '',
        });
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to initiate trial');
      }
    } catch {
      alert('Error initiating trial');
    } finally {
      setSubmittingAction(false);
    }
  };

  // -------------------------------------------------------------
  // THERAPY PLAN & SOAP SESSION HANDLERS
  // -------------------------------------------------------------
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const res = await apiFetch(`/api/v1/patients/${id}/therapy-plans`, {
        method: 'POST',
        body: JSON.stringify(planForm),
      });
      if (res.ok) {
        setIsPlanModalOpen(false);
        setPlanForm({
          department: 'SPEECH_THERAPY',
          title: '',
          goals: '',
          homeProgram: '',
          targetDate: '',
        });
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create plan');
      }
    } catch {
      alert('Error creating plan');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanId) return;
    try {
      setSubmittingAction(true);
      const res = await apiFetch(`/api/v1/patients/${id}/therapy-plans/${activePlanId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(sessionForm),
      });
      if (res.ok) {
        setIsSessionModalOpen(false);
        setActivePlanId(null);
        setSessionForm({
          department: 'SPEECH_THERAPY',
          subjective: '',
          objective: '',
          assessment: '',
          planNext: '',
          vitalstimUsed: false,
          homeProgramAssigned: '',
        });
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record session note');
      }
    } catch {
      alert('Error recording session');
    } finally {
      setSubmittingAction(false);
    }
  };

  // -------------------------------------------------------------
  // INVOICING HANDLERS
  // -------------------------------------------------------------
  const handleCreateInvoiceForPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const payload: any = {
        patientId: id,
        items: invoiceItems,
        isGstApplied,
        discount: 0,
      };

      const paidVal = parseFloat(initialPaymentAmount) || 0;
      if (paidVal > 0) {
        payload.initialPayment = {
          amount: paidVal,
          mode: paymentMode,
        };
      }

      const res = await apiFetch('/api/v1/billing/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsInvoiceModalOpen(false);
        setInitialPaymentAmount('');
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create invoice');
      }
    } catch {
      alert('Error generating invoice');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleQuickPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.invoice) return;
    try {
      setSubmittingAction(true);
      const res = await apiFetch(`/api/v1/billing/invoices/${paymentModal.invoice.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(quickPayAmount),
          mode: quickPayMode,
        }),
      });

      if (res.ok) {
        setPaymentModal({ open: false, invoice: null });
        setQuickPayAmount('');
        refetch();
      } else {
        const err = await res.json();
        alert(err.error || 'Payment failed');
      }
    } catch {
      alert('Error recording payment');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0b3037] animate-spin mb-3" />
        <p className="text-sm font-medium text-stone-600">Loading patient profile & decrypted records...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">Patient Record Unavailable</h2>
        <p className="text-sm text-stone-500">
          {(error as any)?.message || 'The requested patient profile could not be retrieved.'}
        </p>
        <Link
          to="/admin/patients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b3037] text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/patients"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all cursor-pointer"
            title="Back to Patients"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037]">
                {data.fullName}
              </h1>
              <span className="font-mono text-xs font-semibold bg-[#0b3037]/10 text-[#0b3037] px-2.5 py-0.5 rounded-md">
                {data.uhid}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Registered on{' '}
              {new Date(data.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all cursor-pointer shadow-xs"
            title="Download DPDP Section 11 Data Portability Export"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all cursor-pointer shadow-xs"
          >
            <Edit className="w-3.5 h-3.5 text-stone-500" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-amber-700 hover:bg-amber-50 transition-all cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Archive</span>
          </button>

          <button
            onClick={() => {
              setErasePassword('');
              setEraseConfirmText('');
              setEraseError('');
              setIsEraseModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer shadow-xs"
            title="Permanent erasure under DPDP Section 12"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>DPDP Permanent Erase</span>
          </button>
        </div>
      </div>

      {/* DPDP Consent Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          data.hasActiveConsent
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {data.hasActiveConsent ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <span>DPDP Act 2023: {data.hasActiveConsent ? 'Active Patient Consent' : 'Consent Withdrawn'}</span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {data.hasActiveConsent
                  ? 'Valid informed consent is in effect for diagnosis, clinical therapy notes, and medical record keeping.'
                  : 'Patient consent has been withdrawn. Creating new clinical notes is blocked under Section 6 of DPDP Act 2023.'}
              </p>
            </div>
          </div>

          {data.hasActiveConsent ? (
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-amber-800 border border-amber-300 hover:bg-amber-100/50 transition-all cursor-pointer"
            >
              Withdraw Consent
            </button>
          ) : (
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0b3037] text-white hover:bg-[#124b55] transition-all cursor-pointer"
            >
              Re-establish Consent
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { key: 'overview', label: 'Overview & Profile', icon: User, count: null },
          { key: 'visits', label: 'Clinical Visits', icon: FileText, count: data.visits?.length },
          { key: 'audiology', label: 'Audiograms', icon: Activity, count: data.audiograms?.length },
          { key: 'hearing_aids', label: 'Hearing Aids & Trials', icon: Headphones, count: data.hearingAidTrials?.length },
          { key: 'therapy', label: 'Therapy Plans (SOAP)', icon: History, count: data.therapyPlans?.length },
          { key: 'billing', label: 'Invoices & Billing', icon: Receipt, count: data.invoices?.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#0b3037] text-[#0b3037]'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-[#0b3037] text-white' : 'bg-stone-200 text-stone-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & PROFILE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider border-b border-stone-100 pb-2">
                Patient Information
              </h3>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                      Primary Phone
                    </span>
                    <span className="font-medium text-stone-900">{data.phone}</span>
                  </div>
                </div>

                {data.alternatePhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                        Alternate / Guardian
                      </span>
                      <span>{data.alternatePhone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                      Email Address
                    </span>
                    <span>{data.email || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                      Age & Gender
                    </span>
                    <span>
                      {data.age ? `${data.age} years old` : 'Age not recorded'}
                      {data.gender ? ` • ${data.gender}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                      Address
                    </span>
                    <span>{data.address || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-stone-100">
                  <User className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                      Referral Source
                    </span>
                    <span>{data.referralSource || 'Direct Walk-in'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent History Card */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider border-b border-stone-100 pb-2">
                DPDP Consent Audit History
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {data.consentRecords?.map((record: any) => (
                  <div key={record.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">
                        Version {record.consentVersion}
                      </span>
                      {record.withdrawn ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Withdrawn
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Granted
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Date: {new Date(record.consentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Clinical Case History */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider border-b border-stone-100 pb-2">
                Chief Complaint / Presenting Concern
              </h3>
              <p className="text-sm text-stone-800 leading-relaxed font-medium">
                {data.chiefComplaint}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider">
                  Detailed Clinical Case History
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Decrypted for Doctor View
                </span>
              </div>
              {data.caseHistory ? (
                <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                  {data.caseHistory}
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  No extended clinical case history recorded. Click "Edit Profile" to add history.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-stone-900">Clinical Encounters & Notes</h2>
              <p className="text-xs text-stone-500">Encrypted consultation histories (AES-256-GCM).</p>
            </div>
            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-4 py-2 bg-[#0b3037] hover:bg-[#124b55] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Record New Encounter
            </button>
          </div>

          {data.visits && data.visits.length > 0 ? (
            <div className="space-y-3">
              {data.visits.map((v: any) => (
                <div key={v.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-stone-100 text-[#0b3037]">
                        {v.visitType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteVisit(v.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Delete Visit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {v.diagnosis && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Diagnosis
                      </span>
                      <div className="text-sm font-bold text-stone-900">{v.diagnosis}</div>
                    </div>
                  )}

                  {v.notes && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Clinical Consultation Notes (Decrypted)
                      </span>
                      <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed mt-0.5">
                        {v.notes}
                      </p>
                    </div>
                  )}

                  {v.plan && (
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b3037] block">
                        Management Plan & Advice
                      </span>
                      <p className="text-stone-700 mt-0.5">{v.plan}</p>
                    </div>
                  )}

                  {v.nextAppointmentDate && (
                    <div className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Next follow-up: {new Date(v.nextAppointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No clinical visits recorded yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Record your first clinical encounter, diagnosis, and treatment plan for {data.fullName}.
              </p>
              <button
                onClick={() => setIsVisitModalOpen(true)}
                className="px-4 py-2 bg-[#0b3037] text-white text-xs font-semibold rounded-xl"
              >
                Record Visit Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIOGRAMS */}
      {activeTab === 'audiology' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-stone-900">Pure Tone Audiometry & Impedance</h2>
              <p className="text-xs text-stone-500">Bilateral hearing thresholds and middle ear compliance.</p>
            </div>
            <button
              onClick={() => setIsAudiogramModalOpen(true)}
              className="px-4 py-2 bg-[#0b3037] hover:bg-[#124b55] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Record Audiometry Test
            </button>
          </div>

          {data.audiograms && data.audiograms.length > 0 ? (
            <div className="space-y-4">
              {data.audiograms.map((ag: any) => {
                const freqs = ag.frequencies || {};
                const r = freqs.right || {};
                const l = freqs.left || {};
                return (
                  <div key={ag.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <div className="font-bold text-sm text-[#0b3037]">{ag.testType}</div>
                        <div className="text-xs text-stone-500">
                          Tested on {new Date(ag.testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAudiogram(ag.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Delete Audiogram"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hearing Thresholds Grid */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-center border border-stone-200 rounded-xl overflow-hidden font-mono">
                        <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2 text-left">Ear Side</th>
                            <th className="p-2">250 Hz</th>
                            <th className="p-2">500 Hz</th>
                            <th className="p-2">1000 Hz</th>
                            <th className="p-2">2000 Hz</th>
                            <th className="p-2">4000 Hz</th>
                            <th className="p-2">8000 Hz</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 font-semibold">
                          <tr className="bg-rose-50/40 text-rose-800">
                            <td className="p-2 text-left font-bold font-sans">Right Ear (🔴 O)</td>
                            <td className="p-2">{r['250'] ?? '—'} dB</td>
                            <td className="p-2">{r['500'] ?? '—'} dB</td>
                            <td className="p-2">{r['1000'] ?? '—'} dB</td>
                            <td className="p-2">{r['2000'] ?? '—'} dB</td>
                            <td className="p-2">{r['4000'] ?? '—'} dB</td>
                            <td className="p-2">{r['8000'] ?? '—'} dB</td>
                          </tr>
                          <tr className="bg-blue-50/40 text-blue-800">
                            <td className="p-2 text-left font-bold font-sans">Left Ear (🔵 X)</td>
                            <td className="p-2">{l['250'] ?? '—'} dB</td>
                            <td className="p-2">{l['500'] ?? '—'} dB</td>
                            <td className="p-2">{l['1000'] ?? '—'} dB</td>
                            <td className="p-2">{l['2000'] ?? '—'} dB</td>
                            <td className="p-2">{l['4000'] ?? '—'} dB</td>
                            <td className="p-2">{l['8000'] ?? '—'} dB</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Tympanometry Badges */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">
                          Right Tympanometry
                        </span>
                        <span className="font-semibold text-stone-800">{ag.tympanometryRight || 'Not tested'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">
                          Left Tympanometry
                        </span>
                        <span className="font-semibold text-stone-800">{ag.tympanometryLeft || 'Not tested'}</span>
                      </div>
                    </div>

                    {ag.interpretation && (
                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b3037] block">
                          Audiologist Interpretation & Remarks
                        </span>
                        <p className="text-stone-700 mt-1 leading-relaxed">{ag.interpretation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <Activity className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No audiometry records recorded yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Log diagnostic Pure Tone Audiometry frequencies and tympanogram compliance.
              </p>
              <button
                onClick={() => setIsAudiogramModalOpen(true)}
                className="px-4 py-2 bg-[#0b3037] text-white text-xs font-semibold rounded-xl"
              >
                Record Audiogram Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HEARING AIDS & TRIALS */}
      {activeTab === 'hearing_aids' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-stone-900">Hearing Aid Trials & Dispensation</h2>
              <p className="text-xs text-stone-500">Track demo units, home evaluation periods, and device sales.</p>
            </div>
            <button
              onClick={() => {
                loadInStockDevices();
                setIsTrialModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0b3037] hover:bg-[#124b55] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Start Device Trial
            </button>
          </div>

          {data.hearingAidTrials && data.hearingAidTrials.length > 0 ? (
            <div className="space-y-3">
              {data.hearingAidTrials.map((tr: any) => (
                <div key={tr.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-stone-900">
                      {tr.inventory?.brand} {tr.inventory?.modelName}
                    </div>
                    <div className="text-xs text-stone-500 font-mono">
                      S/N: {tr.inventory?.serialNumber} · Side: {tr.earSide}
                    </div>
                    <div className="text-xs text-stone-600">
                      Trial Window:{' '}
                      {new Date(tr.trialStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
                      {new Date(tr.trialEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {tr.feedback && (
                      <p className="text-xs text-stone-700 italic mt-1">"{tr.feedback}"</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm text-[#0b3037]">
                      Deposit: ₹{Number(tr.depositAmount).toLocaleString('en-IN')}
                    </div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      tr.outcome === 'ONGOING'
                        ? 'bg-amber-100 text-amber-800'
                        : tr.outcome === 'PURCHASED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {tr.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <Headphones className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No device trials recorded</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Assign an available in-stock hearing aid demo unit to {data.fullName}.
              </p>
              <button
                onClick={() => {
                  loadInStockDevices();
                  setIsTrialModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0b3037] text-white text-xs font-semibold rounded-xl"
              >
                Initiate Trial Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: THERAPY PLANS (SOAP) */}
      {activeTab === 'therapy' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-stone-900">Speech & Language / Physiotherapy Plans</h2>
              <p className="text-xs text-stone-500">Long-term treatment targets and encrypted SOAP session notes.</p>
            </div>
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="px-4 py-2 bg-[#0b3037] hover:bg-[#124b55] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Therapy Plan
            </button>
          </div>

          {data.therapyPlans && data.therapyPlans.length > 0 ? (
            <div className="space-y-6">
              {data.therapyPlans.map((plan: any) => (
                <div key={plan.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0b3037] text-white">
                          {plan.department.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-sm text-stone-900">{plan.title}</h3>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        Started: {new Date(plan.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActivePlanId(plan.id);
                        setSessionForm({ ...sessionForm, department: plan.department });
                        setIsSessionModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#d9ae4a] hover:bg-[#c29a3e] text-[#0b3037] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add SOAP Session
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Clinical Goals
                      </span>
                      <p className="text-stone-800 font-medium mt-0.5">{plan.goals}</p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Home Program Assigned
                      </span>
                      <p className="text-stone-800 mt-0.5">{plan.homeProgram || 'None assigned'}</p>
                    </div>
                  </div>

                  {/* Sessions Timeline */}
                  {plan.sessions && plan.sessions.length > 0 && (
                    <div className="pt-2 space-y-3">
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Session Notes ({plan.sessions.length} Completed)
                      </h4>
                      <div className="space-y-2.5">
                        {plan.sessions.map((sess: any) => (
                          <div key={sess.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900">
                                Session #{sess.sessionNumber} ·{' '}
                                {new Date(sess.sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              {sess.vitalstimUsed && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  VitalStim® Used
                                </span>
                              )}
                            </div>
                            {sess.subjective && (
                              <p className="text-stone-700">
                                <span className="font-bold text-stone-500">S (Subjective):</span> {sess.subjective}
                              </p>
                            )}
                            {sess.objective && (
                              <p className="text-stone-700">
                                <span className="font-bold text-stone-500">O (Objective):</span> {sess.objective}
                              </p>
                            )}
                            {sess.assessment && (
                              <p className="text-stone-700">
                                <span className="font-bold text-stone-500">A (Assessment):</span> {sess.assessment}
                              </p>
                            )}
                            {sess.planNext && (
                              <p className="text-stone-700">
                                <span className="font-bold text-stone-500">P (Plan):</span> {sess.planNext}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <History className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No therapy plans created yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Create a specialized speech, language, swallowing, or physiotherapy treatment plan.
              </p>
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="px-4 py-2 bg-[#0b3037] text-white text-xs font-semibold rounded-xl"
              >
                Create Plan Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: INVOICES & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-stone-900">Patient Billing & Receipts</h2>
              <p className="text-xs text-stone-500">GST tax invoices, payments received, and pending dues.</p>
            </div>
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-4 py-2 bg-[#0b3037] hover:bg-[#124b55] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Generate Invoice
            </button>
          </div>

          {data.invoices && data.invoices.length > 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Balance Due</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-[#0b3037]">{inv.invoiceNumber}</td>
                      <td className="p-3 text-stone-600">
                        {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 font-mono font-bold">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono text-emerald-600 font-semibold">₹{Number(inv.amountPaid).toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono font-bold text-stone-800">₹{Number(inv.balanceDue).toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPrintableInvoice(inv)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setPaymentModal({ open: true, invoice: inv });
                                setQuickPayAmount(inv.balanceDue.toString());
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                            >
                              Pay Due
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <Receipt className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No invoices generated for this patient</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Create a GST compliant consultation or device invoice.
              </p>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="px-4 py-2 bg-[#0b3037] text-white text-xs font-semibold rounded-xl"
              >
                Create Invoice Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD VISIT                                       */}
      {/* ========================================================= */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsVisitModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-serif text-[#0b3037] mb-1">
              Record Clinical Encounter
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Consultation note for {data.fullName} (AES-256-GCM encrypted).
            </p>

            <form onSubmit={handleCreateVisit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Clinical Department</label>
                  <select
                    value={visitForm.visitType}
                    onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="AUDIOLOGY">Audiology & Hearing</option>
                    <option value="SPEECH_THERAPY">Speech Therapy</option>
                    <option value="PHYSIOTHERAPY">Physiotherapy</option>
                    <option value="HEARING_AID">Hearing Aid Trial / Fitting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Bilateral Mild Sensorineural Hearing Loss, Dysphagia"
                  value={visitForm.diagnosis}
                  onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Clinical Examination & Findings (Encrypted)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Otoscopy findings, tympanometry compliance, speech clarity test..."
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Treatment Plan & Advice</label>
                <textarea
                  rows={2}
                  placeholder="Hearing aid trial recommended, 10 sessions of swallowing therapy..."
                  value={visitForm.plan}
                  onChange={(e) => setVisitForm({ ...visitForm, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={visitForm.nextAppointmentDate}
                  onChange={(e) => setVisitForm({ ...visitForm, nextAppointmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Clinical Encounter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD AUDIOGRAM                                   */}
      {/* ========================================================= */}
      {isAudiogramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAudiogramModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-serif text-[#0b3037] mb-1">
              Record Audiogram & Impedance
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Enter dB HL air conduction thresholds for {data.fullName}.
            </p>

            <form onSubmit={handleCreateAudiogram} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Test Date</label>
                  <input
                    type="date"
                    required
                    value={audiogramForm.testDate}
                    onChange={(e) => setAudiogramForm({ ...audiogramForm, testDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Test Protocol</label>
                  <input
                    type="text"
                    value={audiogramForm.testType}
                    onChange={(e) => setAudiogramForm({ ...audiogramForm, testType: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Right Ear Frequencies (Red) */}
              <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200/70">
                <span className="font-bold text-rose-900 block mb-2">Right Ear Thresholds (🔴 O)</span>
                <div className="grid grid-cols-6 gap-2">
                  {['250', '500', '1k', '2k', '4k', '8k'].map((freq) => (
                    <div key={freq}>
                      <span className="text-[10px] text-stone-500 block text-center font-mono">{freq}</span>
                      <input
                        type="number"
                        min={-10}
                        max={120}
                        value={(audiogramForm as any)[`r${freq}`]}
                        onChange={(e) =>
                          setAudiogramForm({
                            ...audiogramForm,
                            [`r${freq}`]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-1.5 border border-rose-200 rounded-lg text-center font-mono font-bold text-rose-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Ear Frequencies (Blue) */}
              <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/70">
                <span className="font-bold text-blue-900 block mb-2">Left Ear Thresholds (🔵 X)</span>
                <div className="grid grid-cols-6 gap-2">
                  {['250', '500', '1k', '2k', '4k', '8k'].map((freq) => (
                    <div key={freq}>
                      <span className="text-[10px] text-stone-500 block text-center font-mono">{freq}</span>
                      <input
                        type="number"
                        min={-10}
                        max={120}
                        value={(audiogramForm as any)[`l${freq}`]}
                        onChange={(e) =>
                          setAudiogramForm({
                            ...audiogramForm,
                            [`l${freq}`]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-1.5 border border-blue-200 rounded-lg text-center font-mono font-bold text-blue-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tympanometry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Right Tympanogram</label>
                  <select
                    value={audiogramForm.tympanometryRight}
                    onChange={(e) => setAudiogramForm({ ...audiogramForm, tympanometryRight: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="Type A (Normal)">Type A (Normal)</option>
                    <option value="Type As (Shallow/Stiff)">Type As (Shallow/Stiff)</option>
                    <option value="Type Ad (Deep/Flaccid)">Type Ad (Deep/Flaccid)</option>
                    <option value="Type B (Flat/Fluid)">Type B (Flat/Fluid)</option>
                    <option value="Type C (Negative Pressure)">Type C (Negative Pressure)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Left Tympanogram</label>
                  <select
                    value={audiogramForm.tympanometryLeft}
                    onChange={(e) => setAudiogramForm({ ...audiogramForm, tympanometryLeft: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="Type A (Normal)">Type A (Normal)</option>
                    <option value="Type As (Shallow/Stiff)">Type As (Shallow/Stiff)</option>
                    <option value="Type Ad (Deep/Flaccid)">Type Ad (Deep/Flaccid)</option>
                    <option value="Type B (Flat/Fluid)">Type B (Flat/Fluid)</option>
                    <option value="Type C (Negative Pressure)">Type C (Negative Pressure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Audiologist Remarks & Interpretation</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sloping moderate sensorineural hearing loss bilateral, good speech discrimination..."
                  value={audiogramForm.interpretation}
                  onChange={(e) => setAudiogramForm({ ...audiogramForm, interpretation: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAudiogramModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Audiogram</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: START HEARING AID TRIAL                            */}
      {/* ========================================================= */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsTrialModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-serif text-[#0b3037] mb-1">
              Start Hearing Aid Trial
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Assign an available in-stock unit to {data.fullName}.
            </p>

            <form onSubmit={handleCreatePatientTrial} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Choose Available In-Stock Device <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={trialForm.inventoryId}
                  onChange={(e) => setTrialForm({ ...trialForm, inventoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Choose Device --</option>
                  {inventoryList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.brand} {item.modelName} (S/N: {item.serialNumber})
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
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
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
                    onChange={(e) => setTrialForm({ ...trialForm, trialDays: parseInt(e.target.value) || 7 })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={trialForm.depositAmount}
                  onChange={(e) => setTrialForm({ ...trialForm, depositAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Trial Fitting Feedback</label>
                <textarea
                  rows={2}
                  placeholder="Receiver size, dome fit, initial patient remarks..."
                  value={trialForm.feedback}
                  onChange={(e) => setTrialForm({ ...trialForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTrialModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Start Patient Trial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE THERAPY PLAN                                */}
      {/* ========================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-serif text-[#0b3037] mb-1">
              Create Therapy Plan
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Long-term treatment protocol for {data.fullName}.
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Department</label>
                  <select
                    value={planForm.department}
                    onChange={(e) => setPlanForm({ ...planForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="SPEECH_THERAPY">Speech & Language</option>
                    <option value="PHYSIOTHERAPY">Physiotherapy & Mobility</option>
                    <option value="AUDIOLOGY">Auditory Verbal Therapy (AVT)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={planForm.targetDate}
                    onChange={(e) => setPlanForm({ ...planForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pediatric Articulation & Speech Clarity Protocol"
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Clinical Goals</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Correct /r/ and /s/ phoneme distortions with 85% accuracy across 3 sessions..."
                  value={planForm.goals}
                  onChange={(e) => setPlanForm({ ...planForm, goals: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Home Exercise Program</label>
                <textarea
                  rows={2}
                  placeholder="Daily vocal cord warm-ups, mirror placement exercises..."
                  value={planForm.homeProgram}
                  onChange={(e) => setPlanForm({ ...planForm, homeProgram: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Therapy Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD SOAP SESSION                                   */}
      {/* ========================================================= */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsSessionModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-serif text-[#0b3037] mb-1">
              Add SOAP Therapy Session Note
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Structured clinical documentation for {data.fullName}.
            </p>

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2 pb-1">
                <input
                  type="checkbox"
                  id="vitalstim"
                  checked={sessionForm.vitalstimUsed}
                  onChange={(e) => setSessionForm({ ...sessionForm, vitalstimUsed: e.target.checked })}
                  className="w-4 h-4 accent-[#0b3037] rounded"
                />
                <label htmlFor="vitalstim" className="font-bold text-stone-800">
                  VitalStim® / NMES Electrotherapy Used During Session
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  S — Subjective (Patient / Caregiver Report)
                </label>
                <textarea
                  rows={2}
                  placeholder="Patient reports improved swallowing without coughing on liquids..."
                  value={sessionForm.subjective}
                  onChange={(e) => setSessionForm({ ...sessionForm, subjective: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  O — Objective (Measurable Data & Exercises)
                </label>
                <textarea
                  rows={2}
                  placeholder="Completed 20 minutes VitalStim at 6.5 mA with Masako swallow maneuvers..."
                  value={sessionForm.objective}
                  onChange={(e) => setSessionForm({ ...sessionForm, objective: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  A — Assessment (Clinical Analysis & Progress)
                </label>
                <textarea
                  rows={2}
                  placeholder="Laryngeal elevation strength improved; patient tolerated puree textures..."
                  value={sessionForm.assessment}
                  onChange={(e) => setSessionForm({ ...sessionForm, assessment: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  P — Plan (Next Session Goals)
                </label>
                <textarea
                  rows={2}
                  placeholder="Progress to nectar-thickened liquids next Monday at 10 AM..."
                  value={sessionForm.planNext}
                  onChange={(e) => setSessionForm({ ...sessionForm, planNext: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save SOAP Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: GENERATE INVOICE FOR THIS PATIENT                  */}
      {/* ========================================================= */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-serif text-[#0b3037] mb-1">
              Generate GST Invoice
            </h2>
            <p className="text-xs text-stone-500 mb-5">
              Billed to {data.fullName} ({data.uhid}).
            </p>

            <form onSubmit={handleCreateInvoiceForPatient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Item</label>
                <input
                  type="text"
                  required
                  value={invoiceItems[0].description}
                  onChange={(e) => setInvoiceItems([{ ...invoiceItems[0], description: e.target.value }])}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={invoiceItems[0].hsnSac}
                    onChange={(e) => setInvoiceItems([{ ...invoiceItems[0], hsnSac: e.target.value }])}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={invoiceItems[0].unitPrice}
                    onChange={(e) => setInvoiceItems([{ ...invoiceItems[0], unitPrice: parseFloat(e.target.value) || 0 }])}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="invGst"
                  checked={isGstApplied}
                  onChange={(e) => setIsGstApplied(e.target.checked)}
                  className="w-4 h-4 accent-[#0b3037] rounded"
                />
                <label htmlFor="invGst" className="font-semibold text-stone-700">
                  Include 18% GST (CGST 9% + SGST 9%)
                </label>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <label className="block font-semibold text-stone-700 mb-1">
                  Payment Received at Billing (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1500"
                    value={initialPaymentAmount}
                    onChange={(e) => setInitialPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
                  />
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: QUICK PAY INVOICE                                  */}
      {/* ========================================================= */}
      {paymentModal.open && paymentModal.invoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPaymentModal({ open: false, invoice: null })}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold font-serif text-[#0b3037] mb-1">
              Pay Balance Due
            </h2>
            <p className="text-xs text-stone-500 mb-4">
              Invoice #{paymentModal.invoice.invoiceNumber} · Due: ₹{paymentModal.invoice.balanceDue}
            </p>

            <form onSubmit={handleQuickPay} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModal.invoice.balanceDue}
                  value={quickPayAmount}
                  onChange={(e) => setQuickPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono font-bold text-base text-[#0b3037]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Method</label>
                <select
                  value={quickPayMode}
                  onChange={(e) => setQuickPayMode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ open: false, invoice: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Record Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL                                        */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <h2 className="text-xl font-serif font-bold text-[#0b3037]">Edit Patient Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => editMutation.mutate(d))} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    {...register('fullName')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                  {editErrors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1">{editErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                  <input
                    {...register('phone')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                  {editErrors.phone && (
                    <p className="text-[11px] text-red-600 mt-1">{editErrors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Alternate Phone</label>
                  <input
                    {...register('alternatePhone')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Age</label>
                  <input
                    type="number"
                    {...register('age')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Address</label>
                <input
                  {...register('address')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Referral Source</label>
                <input
                  {...register('referralSource')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Chief Complaint</label>
                <textarea
                  rows={2}
                  {...register('chiefComplaint')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Clinical Case History (AES-256-GCM Encrypted)
                </label>
                <textarea
                  rows={4}
                  {...register('caseHistory')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isEditing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ARCHIVE MODAL                                             */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900">Archive Patient Record?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Archiving marks this patient record as inactive. Clinical records are preserved in accordance with healthcare retention guidelines and DPDP requirements.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DPDP PERMANENT ERASE MODAL                                */}
      {/* ========================================================= */}
      {isEraseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-rose-100">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  DPDP Act 2023 Permanent Erasure
                </h3>
                <span className="text-[11px] text-rose-600 font-semibold uppercase">
                  Section 12 Right to Erasure
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              This action is <span className="font-bold text-rose-600">IRREVERSIBLE</span>. All electronic records, diagnoses, encrypted clinical notes, audiograms, invoices, and consent logs for {data.fullName} will be completely purged.
            </p>

            {eraseError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {eraseError}
              </div>
            )}

            <div className="space-y-3 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Type <span className="font-mono text-rose-600 font-bold">PERMANENTLY ERASE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={eraseConfirmText}
                  onChange={(e) => setEraseConfirmText(e.target.value)}
                  placeholder="PERMANENTLY ERASE"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Administrator Password Required:
                </label>
                <input
                  type="password"
                  value={erasePassword}
                  onChange={(e) => setErasePassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsEraseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentErase}
                disabled={eraseConfirmText !== 'PERMANENTLY ERASE' || !erasePassword}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl cursor-pointer"
              >
                Execute Permanent Erasure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WITHDRAW CONSENT MODAL                                    */}
      {/* ========================================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Record Patient Consent Withdrawal?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Under India DPDP Act 2023 Section 6(4), patients may withdraw consent at any time. Once withdrawn, creating new clinical records is legally blocked until consent is re-established.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => withdrawConsentMutation.mutate()}
                disabled={withdrawConsentMutation.isPending}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer"
              >
                Confirm Consent Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENEW CONSENT MODAL                                       */}
      {/* ========================================================= */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Re-establish Informed Patient Consent?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Records a new consent authorization timestamp for {data.fullName}. Unblocks new diagnosis, treatment notes, and audiology testing.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => renewConsentMutation.mutate()}
                disabled={renewConsentMutation.isPending}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-xl cursor-pointer"
              >
                Re-establish Active Consent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {printableInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase">
                Invoice #{printableInvoice.invoiceNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 text-xs font-bold text-white bg-[#0b3037] rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setPrintableInvoice(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-4 space-y-4 text-xs text-stone-800">
              <div>
                <h3 className="text-base font-bold font-serif text-[#0b3037]">
                  SHREE Multidisciplinary Healthcare
                </h3>
                <p className="text-[11px] text-stone-500">Freedom Hospitals, Mokila, Hyderabad</p>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 font-bold block text-[10px]">PATIENT</span>
                  <div className="font-bold text-stone-900">{data.fullName}</div>
                  <div className="font-mono text-stone-500">{data.uhid}</div>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 font-bold block text-[10px]">STATUS</span>
                  <div className="font-bold text-emerald-700">{printableInvoice.status}</div>
                  <div className="font-mono font-bold text-stone-800">
                    Total: ₹{Number(printableInvoice.totalAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-stone-400 font-mono">
                Computer-generated official clinical receipt
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
