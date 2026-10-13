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
  Hearing,
  Clock,
  X,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react';
import { apiFetch } from '../api/client';

// -------------------------------------------------------------
// EDIT SCHEMA
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

  // Permanent erase form state
  const [erasePassword, setErasePassword] = useState('');
  const [eraseConfirmText, setEraseConfirmText] = useState('');
  const [eraseError, setEraseError] = useState('');

  // Fetch Patient Details
  const { data, isLoading, isError, error } = useQuery({
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

  // Populate edit form when opened
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

  // Edit Mutation
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

  // Soft Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive patient');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/admin/patients');
    },
  });

  // Permanent Erase Mutation
  const eraseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}/erase`, {
        method: 'POST',
        body: JSON.stringify({
          adminPassword: erasePassword,
          confirmationText: eraseConfirmText,
        }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Erase failed');
      return resJson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/admin/patients');
    },
    onError: (err: any) => {
      setEraseError(err.message || 'Failed to erase patient');
    },
  });

  // Withdraw Consent Mutation
  const withdrawConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}/consent/withdraw`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to record consent withdrawal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setIsWithdrawModalOpen(false);
    },
  });

  // Renew Consent Mutation
  const renewConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/v1/patients/${id}/consent`, {
        method: 'POST',
        body: JSON.stringify({ consentVersion: '1.1', notes: 'Consent renewed via admin console' }),
      });
      if (!res.ok) throw new Error('Failed to re-establish consent');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setIsRenewModalOpen(false);
    },
  });

  // Export Data (DPDP Data Portability)
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
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all"
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-red-600" />
            <span>DPDP Permanent Erase</span>
          </button>
        </div>
      </div>

      {/* DPDP Consent Banner */}
      <div
        className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          data.hasActiveConsent
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start gap-3">
          {data.hasActiveConsent ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {data.hasActiveConsent
                ? 'DPDP Act 2023: Active Patient Consent'
                : 'DPDP Act 2023: Patient Consent Withdrawn'}
            </h4>
            <p className="text-xs mt-0.5 opacity-90">
              {data.hasActiveConsent
                ? 'Valid informed consent is in effect for diagnosis, clinical therapy notes, and medical record keeping.'
                : 'Consent was withdrawn by patient request. Creating new clinical visits or therapy records is restricted until consent is renewed.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
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
          { key: 'overview', label: 'Overview & Profile', icon: User },
          { key: 'visits', label: 'Clinical Visits', icon: FileText },
          { key: 'audiology', label: 'Audiograms', icon: Activity },
          { key: 'hearing_aids', label: 'Hearing Aids & Trials', icon: Calendar },
          { key: 'therapy', label: 'Therapy Plans (SOAP)', icon: History },
          { key: 'billing', label: 'Invoices & Billing', icon: ShieldCheck },
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
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Demographics & Contact */}
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
                    <span className="font-semibold text-stone-900">{data.phone}</span>
                  </div>
                </div>

                {data.alternatePhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                        Alternate Phone
                      </span>
                      <span>{data.alternatePhone}</span>
                    </div>
                  </div>
                )}

                {data.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                        Email Address
                      </span>
                      <span>{data.email}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                      Age & Gender
                    </span>
                    <span>
                      {data.age ? `${data.age} years old` : 'Age unspecified'}
                      {data.gender ? ` • ${data.gender}` : ''}
                    </span>
                  </div>
                </div>

                {data.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                        Address
                      </span>
                      <span>{data.address}</span>
                    </div>
                  </div>
                )}

                {data.referralSource && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                    <div>
                      <span className="block text-stone-400 text-[10px] uppercase font-semibold">
                        Referral Source
                      </span>
                      <span>{data.referralSource}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Consent History Card */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider border-b border-stone-100 pb-2">
                DPDP Consent Audit History
              </h3>

              <div className="space-y-3">
                {data.consentRecords?.map((record: any) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800">
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
                      Date:{' '}
                      {new Date(record.consentDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {record.notes && (
                      <p className="text-[11px] text-stone-600 italic">"{record.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Clinical Concerns & Case History */}
          <div className="space-y-6 lg:col-span-2">
            {/* Chief Complaint */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider border-b border-stone-100 pb-2">
                Chief Complaint / Presenting Concern
              </h3>
              <p className="text-sm text-stone-800 leading-relaxed font-medium">
                {data.chiefComplaint}
              </p>
            </div>

            {/* Case History (Decrypted on this view only) */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider">
                  Detailed Clinical Case History
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Decrypted for Doctor View
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

            {/* Recent Encounters Summary */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#0b3037] uppercase tracking-wider border-b border-stone-100 pb-2">
                Recent Clinical Encounters
              </h3>

              {data.visits && data.visits.length > 0 ? (
                <div className="space-y-3">
                  {data.visits.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-stone-900">
                          {v.visitType.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {new Date(v.visitDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {v.diagnosis && (
                          <div className="text-xs text-stone-700 mt-1 font-medium">
                            Diagnosis: {v.diagnosis}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  No clinical visit encounters recorded yet. Visits module is ready for next step.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PLACEHOLDER TABS */}
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#0b3037]/10 text-[#0b3037] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-800">
            {activeTab === 'visits' && 'Clinical Visits Module'}
            {activeTab === 'audiology' && 'Audiogram & Tympanometry Module'}
            {activeTab === 'hearing_aids' && 'Hearing Aid Trials & Dispensation'}
            {activeTab === 'therapy' && 'Speech & Language SOAP Therapy Plans'}
            {activeTab === 'billing' && 'GST Billing & Invoices Module'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            This module integrates directly with {data.fullName}'s electronic health record and will be activated in the upcoming steps.
          </p>
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    {...register('alternatePhone')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    {...register('email')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Age</label>
                  <input
                    type="number"
                    {...register('age')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
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
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Chief Complaint
                </label>
                <textarea
                  {...register('chiefComplaint')}
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Case History (Encrypted AES-256-GCM)
                </label>
                <textarea
                  {...register('caseHistory')}
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing || editMutation.isPending}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-xl flex items-center gap-2"
                >
                  {(isEditing || editMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SOFT DELETE CONFIRMATION MODAL                            */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Archive Patient Record</h3>
                <p className="text-xs text-stone-500">{data.fullName} ({data.uhid})</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              This patient will be archived and hidden from general search and appointments.
              Their records remain safe and can be restored if necessary.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                {deleteMutation.isPending ? 'Archiving...' : 'Yes, Archive Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DPDP PERMANENT ERASURE MODAL (Admin password required)     */}
      {/* ========================================================= */}
      {isEraseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-base">DPDP Permanent Erasure</h3>
                <p className="text-xs text-red-600">Irreversible Action under DPDP Act 2023</p>
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
              <p className="font-semibold">⚠️ Danger Zone: Permanent Data Deletion</p>
              <p>
                All records for <strong>{data.fullName}</strong> ({data.uhid}), including clinical visits, audiograms, therapy sessions, invoices, and consent logs will be <strong>permanently purged</strong>.
              </p>
            </div>

            {eraseError && (
              <div className="p-2.5 rounded-xl bg-red-100 text-red-800 text-xs font-medium">
                {eraseError}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Type <span className="font-mono text-red-700">PERMANENTLY ERASE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={eraseConfirmText}
                  onChange={(e) => setEraseConfirmText(e.target.value)}
                  placeholder="PERMANENTLY ERASE"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Admin Password:
                </label>
                <input
                  type="password"
                  value={erasePassword}
                  onChange={(e) => setErasePassword(e.target.value)}
                  placeholder="Enter your admin account password"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsEraseModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => eraseMutation.mutate()}
                disabled={
                  eraseConfirmText !== 'PERMANENTLY ERASE' ||
                  !erasePassword ||
                  eraseMutation.isPending
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs"
              >
                {eraseMutation.isPending ? 'Purging Records...' : 'Erase All Data'}
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Withdraw Patient Consent</h3>
                <p className="text-xs text-stone-500">DPDP Act 2023 Consent Revocation</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Recording consent withdrawal will legally prevent staff from entering new clinical notes,
              audiograms, or therapy sessions for {data.fullName} until consent is re-established.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => withdrawConsentMutation.mutate()}
                disabled={withdrawConsentMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                {withdrawConsentMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RE-ESTABLISH CONSENT MODAL                                */}
      {/* ========================================================= */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Renew Patient Consent</h3>
                <p className="text-xs text-stone-500">Record Active Consent</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Patient has reaffirmed informed consent under DPDP Act 2023. This will unblock clinical
              record keeping for {data.fullName}.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => renewConsentMutation.mutate()}
                disabled={renewConsentMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-xl shadow-xs"
              >
                {renewConsentMutation.isPending ? 'Saving...' : 'Grant Consent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientDetailPage;
