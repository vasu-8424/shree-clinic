import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  X,
  Phone,
  Calendar,
  FileText,
  User,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../api/client';

// -------------------------------------------------------------
// TYPES & SCHEMAS
// -------------------------------------------------------------

const addPatientSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required (min 2 characters)'),
  phone: z.string().trim().min(10, 'Valid 10-digit mobile number required'),
  alternatePhone: z.string().trim().optional(),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  age: z.coerce.number().min(0).max(125).optional().nullable(),
  gender: z.string().optional(),
  address: z.string().trim().optional(),
  referralSource: z.string().trim().optional(),
  chiefComplaint: z.string().trim().min(3, 'Chief complaint / reason for visit is required'),
  caseHistory: z.string().trim().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Patient informed consent is required by DPDP Act 2023' }),
  }),
  consentVersion: z.string().default('1.0'),
  consentNotes: z.string().optional(),
});

type AddPatientFormData = z.infer<typeof addPatientSchema>;

export interface PatientSummary {
  id: string;
  uhid: string;
  fullName: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
  referralSource?: string | null;
  chiefComplaint: string;
  createdAt: string;
  consentStatus: 'ACTIVE' | 'WITHDRAWN';
}

export const PatientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    show: boolean;
    existingPatientId?: string;
    existingUhid?: string;
    pendingData?: AddPatientFormData;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      consentVersion: '1.0',
    },
  });

  // Query Patients
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patients', { search, genderFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search) params.append('search', search);
      if (genderFilter) params.append('gender', genderFilter);

      const res = await apiFetch(`/api/v1/patients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch patient list');
      return res.json() as Promise<{
        data: PatientSummary[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>;
    },
  });

  // Create Patient Mutation
  const createPatientMutation = useMutation({
    mutationFn: async ({
      formData,
      allowDuplicate = false,
    }: {
      formData: AddPatientFormData;
      allowDuplicate?: boolean;
    }) => {
      const payload = { ...formData, allowDuplicate };
      const res = await apiFetch('/api/v1/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (res.status === 409) {
        throw { isDuplicate: true, ...responseData };
      }
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to register patient');
      }
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsAddModalOpen(false);
      setDuplicateWarning(null);
      reset();
    },
    onError: (err: any) => {
      if (err.isDuplicate) {
        setDuplicateWarning({
          show: true,
          existingPatientId: err.existingPatient?.id,
          existingUhid: err.existingPatient?.uhid,
        });
      }
    },
  });

  const onSubmit = (formData: AddPatientFormData) => {
    setDuplicateWarning({ show: false, pendingData: formData });
    createPatientMutation.mutate({ formData, allowDuplicate: false });
  };

  const handleConfirmDuplicateOverride = () => {
    if (duplicateWarning?.pendingData) {
      createPatientMutation.mutate({
        formData: duplicateWarning.pendingData,
        allowDuplicate: true,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037]">
              Patients Directory
            </h1>
            {data?.pagination && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0b3037]/10 text-[#0b3037]">
                {data.pagination.total} Total
              </span>
            )}
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Compliant patient electronic health records (DPDP Act 2023)
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-[#0b3037] hover:bg-[#124b55] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by UHID (e.g. SHREE-2026-0001), patient name, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037] text-stone-700"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0b3037] animate-spin mb-3" />
          <p className="text-sm font-medium text-stone-600">Loading patients from secure database...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-semibold text-sm">Failed to load patient records</h3>
            <p className="text-xs text-red-700 mt-1">{(error as any)?.message || 'Network error'}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && data?.data.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-stone-400" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-800">No patients found</h3>
          <p className="text-sm text-stone-500 max-w-sm mt-1">
            {search || genderFilter
              ? 'No matching patient records found. Try clearing your filters.'
              : 'Start by registering your first clinic patient.'}
          </p>
          {!search && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0b3037] text-white rounded-xl text-sm font-medium hover:bg-[#124b55] transition-all cursor-pointer"
            >
              Add Patient Now
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">UHID</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Age / Gender</th>
                    <th className="py-3.5 px-4">Chief Complaint</th>
                    <th className="py-3.5 px-4">DPDP Consent</th>
                    <th className="py-3.5 px-4">Registered</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                  {data.data.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-stone-50/70 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-xs text-[#0b3037]">
                        <Link
                          to={`/admin/patients/${patient.id}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <span className="bg-[#0b3037]/10 px-2 py-0.5 rounded-md">
                            {patient.uhid}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-900">
                        <Link
                          to={`/admin/patients/${patient.id}`}
                          className="hover:text-[#0b3037] transition-colors"
                        >
                          {patient.fullName}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-stone-800">{patient.phone}</div>
                        {patient.email && (
                          <div className="text-[11px] text-stone-400 truncate max-w-[150px]">
                            {patient.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-600">
                        {patient.age ? `${patient.age} yrs` : '—'}
                        {patient.gender ? ` • ${patient.gender}` : ''}
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-600 max-w-[220px] truncate">
                        {patient.chiefComplaint}
                      </td>
                      <td className="py-3 px-4">
                        {patient.consentStatus === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            Withdrawn
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-500 whitespace-nowrap">
                        {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/patients/${patient.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b3037] hover:text-[#124b55] px-2.5 py-1 rounded-lg hover:bg-stone-100 transition-all"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (< lg screens) */}
          <div className="lg:hidden space-y-3">
            {data.data.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#0b3037] bg-[#0b3037]/10 px-2 py-0.5 rounded-md">
                      {patient.uhid}
                    </span>
                    <h3 className="font-bold text-base text-stone-900 mt-1.5">
                      {patient.fullName}
                    </h3>
                  </div>

                  {patient.consentStatus === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Active Consent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Withdrawn
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {patient.age ? `${patient.age}y` : 'Age N/A'}
                      {patient.gender ? ` • ${patient.gender}` : ''}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-2.5 text-xs text-stone-600 line-clamp-2">
                  <span className="font-semibold text-stone-800">Complaint: </span>
                  {patient.chiefComplaint}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="text-[11px] text-stone-400">
                    {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <Link
                    to={`/admin/patients/${patient.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3037] hover:text-[#124b55]"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-200 pt-4 px-2">
              <span className="text-xs text-stone-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} patients)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={data.pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <button
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-all flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* ADD PATIENT MODAL (DPDP Compliant + react-hook-form)     */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0b3037]">
                  Register New Patient
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Generates an atomic UHID (SHREE-YYYY-XXXX) and records initial DPDP consent
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="e.g. Rahul Reddy"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Primary Phone */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primary Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="e.g. 9876543210 (Normalized to +91)"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alternate / Guardian Phone
                  </label>
                  <input
                    {...register('alternatePhone')}
                    placeholder="Optional guardian contact"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="patient@example.com (optional)"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Age</label>
                  <input
                    type="number"
                    {...register('age')}
                    placeholder="e.g. 35"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                  />
                </div>

                {/* Gender */}
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

              {/* Referral Source */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Referral Source
                </label>
                <input
                  {...register('referralSource')}
                  placeholder="e.g. Dr. Rao, Freedom Hospitals, Walk-in, Website"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Address</label>
                <input
                  {...register('address')}
                  placeholder="Mokila, Shankarpalli, Hyderabad..."
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Chief Complaint / Primary Concern <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('chiefComplaint')}
                  rows={2}
                  placeholder="Reason for clinical visit (e.g. bilateral hearing loss, stammering, dysphagia)..."
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
                {errors.chiefComplaint && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.chiefComplaint.message}</p>
                )}
              </div>

              {/* Case History (Encrypted) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Clinical Case History <span className="text-[10px] text-emerald-700 font-normal">(Encrypted at rest AES-256-GCM)</span>
                </label>
                <textarea
                  {...register('caseHistory')}
                  rows={3}
                  placeholder="Detailed medical history, prior diagnoses, onset, ENT consultations..."
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
                />
              </div>

              {/* DPDP ACT 2023 CONSENT SECTION */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#0b3037] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0b3037] uppercase tracking-wider">
                      DPDP Act 2023 Patient Consent Notice
                    </h4>
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                      "I hereby explicitly consent to the collection, processing, and encrypted storage
                      of my personal and clinical healthcare records by SHREE Multidisciplinary Healthcare
                      at Freedom Hospitals, Mokila, solely for diagnosis, treatment, and medical records maintenance
                      under the provisions of the Digital Personal Data Protection Act, 2023."
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-amber-200/60">
                  <input
                    type="checkbox"
                    {...register('consent')}
                    className="w-4 h-4 mt-0.5 accent-[#0b3037] rounded"
                  />
                  <span className="text-xs font-semibold text-stone-900">
                    Patient has read, understood, and granted explicit informed consent (Mandatory)
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-[11px] font-medium text-red-600 pl-7">{errors.consent.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createPatientMutation.isPending}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {(isSubmitting || createPatientMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Register Patient & Record Consent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DUPLICATE PATIENT OVERRIDE WARNING MODAL                  */}
      {/* ========================================================= */}
      {duplicateWarning?.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Duplicate Patient Detected</h3>
                <p className="text-xs text-stone-500">Matching phone and full name found</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              A patient with this name and phone number already exists in the clinic database
              {duplicateWarning.existingUhid ? ` (UHID: ${duplicateWarning.existingUhid})` : ''}.
              Family members frequently share a phone number. Would you like to proceed with registration anyway?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDuplicateOverride}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0b3037] hover:bg-[#124b55] rounded-xl shadow-xs"
              >
                Yes, Register as Family Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientsPage;
