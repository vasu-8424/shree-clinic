import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  FileText,
  Upload,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Download,
  ExternalLink,
  ChevronRight,
  Printer,
  X,
  Loader2,
  AlertCircle,
  FileCheck,
  Zap,
  Flame,
  HeartPulse,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { PatientJourneyModal } from '../components/PatientJourneyModal';

type TabMode = 'notes' | 'pdfs' | 'progress';

export const PhysiotherapyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('notes');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Data states
  const [sessions, setSessions] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedProgressModal, setSelectedProgressModal] = useState<any | null>(null);

  // Selected Patient Clinical Journey Modal
  const [selectedJourneyModal, setSelectedJourneyModal] = useState<{
    isOpen: boolean;
    patient?: any;
    identifier?: string;
  }>({ isOpen: false });

  // Forms
  const [noteForm, setNoteForm] = useState({
    patientId: '',
    sessionNumber: 1,
    sessionDate: new Date().toISOString().split('T')[0],
    painScoreVas: 6,
    modality: 'Cervical Traction + Ultrasound + TENS',
    subjective: '',
    objective: '',
    assessment: '',
    planNext: '',
    vitalstimUsed: true,
    homeProgramAssigned: '',
  });

  const [pdfForm, setPdfForm] = useState({
    patientId: '',
    fileName: '',
    category: 'Physiotherapy Assessment PDF',
    fileData: '',
    fileSize: 412000,
  });

  const [planForm, setPlanForm] = useState({
    patientId: '',
    title: '',
    goals: '',
    homeProgram: '',
    targetDate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessRes, attRes, progRes, patRes] = await Promise.all([
        apiFetch('/api/v1/therapy/sessions?department=PHYSIOTHERAPY'),
        apiFetch('/api/v1/therapy/attachments?category=Physio'),
        apiFetch('/api/v1/therapy/progress-reports?department=PHYSIOTHERAPY'),
        apiFetch('/api/v1/patients?limit=100'),
      ]);

      if (sessRes.ok) {
        const d = await sessRes.json();
        setSessions(d.sessions || []);
      }
      if (attRes.ok) {
        const d = await attRes.json();
        setAttachments(d.attachments || []);
      }
      if (progRes.ok) {
        const d = await progRes.json();
        setProgressReports(d.progressReports || []);
      }
      if (patRes.ok) {
        const d = await patRes.json();
        setPatientsList(d.data || d.patients || []);
      }
    } catch (err) {
      console.error('Failed to load physiotherapy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/therapy/sessions', {
        method: 'POST',
        body: JSON.stringify({
          ...noteForm,
          department: 'PHYSIOTHERAPY',
          subjective: `[Pain VAS: ${noteForm.painScoreVas}/10] ${noteForm.subjective}`,
          objective: `[Modality: ${noteForm.modality}] ${noteForm.objective}`,
        }),
      });
      if (res.ok) {
        setIsNoteModalOpen(false);
        setNoteForm({
          patientId: '',
          sessionNumber: 1,
          sessionDate: new Date().toISOString().split('T')[0],
          painScoreVas: 5,
          modality: 'Ultrasound + TENS',
          subjective: '',
          objective: '',
          assessment: '',
          planNext: '',
          vitalstimUsed: true,
          homeProgramAssigned: '',
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save note');
      }
    } catch {
      alert('Error saving note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/therapy/attachments', {
        method: 'POST',
        body: JSON.stringify(pdfForm),
      });
      if (res.ok) {
        setIsUploadPdfModalOpen(false);
        setPdfForm({
          patientId: '',
          fileName: '',
          category: 'Physiotherapy Assessment PDF',
          fileData: '',
          fileSize: 412000,
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to store PDF');
      }
    } catch {
      alert('Error saving PDF');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/therapy/plans', {
        method: 'POST',
        body: JSON.stringify({
          ...planForm,
          department: 'PHYSIOTHERAPY',
        }),
      });
      if (res.ok) {
        setIsPlanModalOpen(false);
        setPlanForm({ patientId: '', title: '', goals: '', homeProgram: '', targetDate: '' });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create plan');
      }
    } catch {
      alert('Error saving plan');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.patientName?.toLowerCase().includes(q) ||
      s.patientUhid?.toLowerCase().includes(q) ||
      s.assessment?.toLowerCase().includes(q) ||
      s.subjective?.toLowerCase().includes(q) ||
      s.objective?.toLowerCase().includes(q)
    );
  });

  const filteredAttachments = attachments.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.fileName?.toLowerCase().includes(q) ||
      a.patient?.fullName?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const filteredProgress = progressReports.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.patientName?.toLowerCase().includes(q) ||
      p.patientUhid?.toLowerCase().includes(q) ||
      p.planTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-400" />
            Physiotherapy & Rehabilitation Workspace
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Department of Physiotherapy: Musculoskeletal & neuro SOAP notes, pain scale/ROM tracking, MRI/X-ray PDF storage, and recovery milestone reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'notes' && (
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Patient Note (SOAP)</span>
            </button>
          )}

          {activeTab === 'pdfs' && (
            <button
              onClick={() => setIsUploadPdfModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Store Clinical PDF / Scan</span>
            </button>
          )}

          {activeTab === 'progress' && (
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Rehab Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-emerald-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Rehab Sessions
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{sessions.length}</div>
          <div className="text-[11px] text-emerald-400/90 mt-0.5">Encounters Documented</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-cyan-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Stored PDFs & Scans
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{attachments.length}</div>
          <div className="text-[11px] text-cyan-400/90 mt-0.5">MRI, X-Rays & ROM Charts</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-purple-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Rehab Programs
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{progressReports.length}</div>
          <div className="text-[11px] text-purple-400/90 mt-0.5">Active Treatment Plans</div>
        </div>

        <div className="bg-[#0e1626] border border-stone-800 rounded-xl p-3.5 hover:border-amber-500/40 transition-colors">
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Modalities Administered
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {sessions.filter((s) => s.vitalstimUsed).length}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-0.5">Traction / IFT / Ultrasound</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Patient Notes (SOAP Encounters) ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pdfs')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pdfs'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <span>Store PDFs & Diagnostic Scans ({attachments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'progress'
              ? 'text-purple-400 border-b-2 border-purple-400 bg-[#0e1626]'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Progress Reports & Recovery ({progressReports.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0e1626] p-4 rounded-2xl border border-stone-800 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'notes'
                ? 'Search physiotherapy notes by patient name, UHID, or clinical diagnosis...'
                : activeTab === 'pdfs'
                ? 'Search stored physio PDFs by scan title or patient...'
                : 'Search recovery reports by patient or rehab goals...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder-stone-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0e1626] rounded-2xl border border-stone-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-xs text-stone-400">Loading physiotherapy clinical encounters...</p>
          </div>
        ) : activeTab === 'notes' ? (
          /* TAB 1: NOTES TABLE */
          filteredSessions.length === 0 ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No physiotherapy notes recorded</h3>
              <p className="text-xs text-stone-400 mt-1">Write your first rehabilitation SOAP encounter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[230px]">Patient</th>
                    <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Session</th>
                    <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Date</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Subjective (S) & Pain Scale</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Objective (O) & Modality</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Assessment & Plan</th>
                    <th className="py-3.5 px-4 min-w-[130px] text-right whitespace-nowrap">Hospital Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredSessions.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#131d33] transition-colors group cursor-pointer"
                      onClick={() =>
                        setSelectedJourneyModal({
                          isOpen: true,
                          identifier: s.patientId || s.patientName,
                        })
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                            {s.patientName}
                          </span>
                          {s.patientUhid && (
                            <span className="font-mono text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded whitespace-nowrap shrink-0 border border-emerald-500/30">
                              {s.patientUhid}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium whitespace-nowrap mt-0.5">
                          {s.patientAge ? `${s.patientAge} yrs • ` : ''}
                          {s.patientPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center font-bold text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          Session #{s.sessionNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300 font-medium whitespace-nowrap">
                        {new Date(s.sessionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-stone-200 line-clamp-2">
                          <span className="font-bold text-emerald-400">S: </span>
                          {s.subjective}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-stone-200 line-clamp-2">
                          <span className="font-bold text-cyan-400">O: </span>
                          {s.objective}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-stone-200 font-medium line-clamp-2">
                          <span className="font-bold text-purple-400">A: </span>
                          {s.assessment}
                        </div>
                        <div className="text-xs text-stone-400 line-clamp-1 mt-1">
                          <span className="font-bold text-amber-400">P: </span>
                          {s.planNext}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all whitespace-nowrap">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span>Timeline</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'pdfs' ? (
          /* TAB 2: STORED PDFS */
          filteredAttachments.length === 0 ? (
            <div className="p-16 text-center">
              <FileCheck className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No stored physiotherapy scans or PDFs</h3>
              <p className="text-xs text-stone-400 mt-1">Attach MRI scans, X-Rays, ROM assessment sheets, or discharge PDFs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0a0f18] border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Document / Scan Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-4">Uploaded Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredAttachments.map((a) => (
                    <tr key={a.id} className="hover:bg-[#131d33] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{a.patient?.fullName || 'Patient'}</span>
                          {a.patient?.uhid && (
                            <span className="font-mono text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                              {a.patient.uhid}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">{a.patient?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-200 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-xs">{a.fileName}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">{a.fileType}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          {a.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-400">
                        {(a.fileSize / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(a.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={a.fileKey}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* TAB 3: PROGRESS REPORTS */
          filteredProgress.length === 0 ? (
            <div className="p-16 text-center">
              <TrendingUp className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-200">No active recovery progress reports</h3>
              <p className="text-xs text-stone-400 mt-1">Create a physiotherapy rehab plan to monitor recovery milestones.</p>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProgress.map((p) => (
                <div
                  key={p.patientId}
                  className="bg-[#0a0f18] border border-stone-800 rounded-xl p-5 hover:border-purple-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-stone-800/80 pb-3">
                      <div>
                        <div className="font-bold text-lg text-white flex items-center gap-2">
                          <span>{p.patientName}</span>
                          <span className="font-mono text-xs font-semibold bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded">
                            {p.patientUhid}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5 font-medium">
                          {p.age} yrs • {p.gender} • {p.phone}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
                          {p.totalSessions} of {p.targetSessions} Sessions
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-1">
                          {p.completionRate}% Progress
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="my-3">
                      <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-stone-400">Rehab Plan: </span>
                        <span className="font-bold text-stone-200">{p.planTitle}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-400">Clinical Goals: </span>
                        <span className="text-stone-300">{p.planGoals}</span>
                      </div>
                      <div className="bg-[#0e1626] p-2.5 rounded-lg border border-stone-800/80">
                        <span className="font-semibold text-emerald-400">Latest Recovery Assessment: </span>
                        <span className="text-stone-300">{p.latestAssessment}</span>
                      </div>
                      <div className="bg-[#0e1626] p-2.5 rounded-lg border border-stone-800/80">
                        <span className="font-semibold text-cyan-400">Home Exercises & Ergonomics: </span>
                        <span className="text-stone-300">{p.homeProgram}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-stone-800/80 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">
                      Last Encounter:{' '}
                      {new Date(p.lastEncounterDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <button
                      onClick={() => setSelectedProgressModal(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Progress Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* MODAL 1: WRITE SOAP PATIENT NOTE */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Write Physiotherapy SOAP Encounter Note
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Select Patient *</label>
                  <select
                    required
                    value={noteForm.patientId}
                    onChange={(e) => setNoteForm({ ...noteForm, patientId: e.target.value })}
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
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Session Number</label>
                  <input
                    type="number"
                    min={1}
                    value={noteForm.sessionNumber}
                    onChange={(e) => setNoteForm({ ...noteForm, sessionNumber: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Pain VAS Score (1-10 Scale): <span className="font-bold text-emerald-400">{noteForm.painScoreVas}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={noteForm.painScoreVas}
                    onChange={(e) => setNoteForm({ ...noteForm, painScoreVas: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                    <span>1: Mild</span>
                    <span>5: Moderate</span>
                    <span>10: Severe</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Treatment Modality Used</label>
                  <input
                    type="text"
                    value={noteForm.modality}
                    onChange={(e) => setNoteForm({ ...noteForm, modality: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Subjective (S) - Patient Complaints & Symptoms *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Patient reports pain centralized to neck, radicular numbness in arm resolved..."
                  value={noteForm.subjective}
                  onChange={(e) => setNoteForm({ ...noteForm, subjective: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Objective (O) - Range of Motion (ROM) & Muscle Strength *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Cervical rotation: Right 65°, Left 70°. Deep neck flexor test: 22s. Spurling test negative..."
                  value={noteForm.objective}
                  onChange={(e) => setNoteForm({ ...noteForm, objective: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Assessment (A) - Recovery Progress *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Excellent recovery trajectory, 75% pain reduction achieved since baseline..."
                  value={noteForm.assessment}
                  onChange={(e) => setNoteForm({ ...noteForm, assessment: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Plan Next (P) - Treatment Plan & Home Exercises *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theraband scapular retractions + postural ergonomics review. Review in 3 days."
                  value={noteForm.planNext}
                  onChange={(e) => setNoteForm({ ...noteForm, planNext: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Home Exercise Protocol Assigned</label>
                <input
                  type="text"
                  placeholder="e.g. Chin tucks 10x3 sets, thoracic foam roller stretches daily"
                  value={noteForm.homeProgramAssigned}
                  onChange={(e) => setNoteForm({ ...noteForm, homeProgramAssigned: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
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
                  <span>Save SOAP Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD CLINICAL PDF / SCAN */}
      {isUploadPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                Store Physiotherapy PDF / Diagnostic Scan
              </h3>
              <button onClick={() => setIsUploadPdfModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadPdf} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Patient *</label>
                <select
                  required
                  value={pdfForm.patientId}
                  onChange={(e) => setPdfForm({ ...pdfForm, patientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-cyan-500"
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
                <label className="block text-xs font-semibold text-stone-300 mb-1">Document / Scan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh_Varma_Cervical_Spine_MRI_Scan.pdf"
                  value={pdfForm.fileName}
                  onChange={(e) => setPdfForm({ ...pdfForm, fileName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Category</label>
                <select
                  value={pdfForm.category}
                  onChange={(e) => setPdfForm({ ...pdfForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-cyan-500"
                >
                  <option value="Physiotherapy Assessment PDF">Initial Musculoskeletal Assessment PDF</option>
                  <option value="MRI & X-Ray Scan PDF">MRI / X-Ray Diagnostic Scan PDF</option>
                  <option value="Range-of-Motion Chart PDF">Range of Motion (ROM) Goniometric Sheet</option>
                  <option value="Rehabilitation Progress PDF">Rehabilitation Progress Report PDF</option>
                  <option value="Discharge & Ergonomic Summary PDF">Discharge Summary & Ergonomic Protocol</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-stone-700 rounded-xl p-5 text-center bg-[#0a0f18]">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-stone-300 font-medium">Select clinical scan / PDF file from system</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Encrypted at rest according to DPDP healthcare compliance</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsUploadPdfModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Clinical PDF</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE REHAB PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Create Physiotherapy Rehabilitation Plan
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-stone-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Patient *</label>
                <select
                  required
                  value={planForm.patientId}
                  onChange={(e) => setPlanForm({ ...planForm, patientId: e.target.value })}
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

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Rehabilitation Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumbar Disc Spondylosis Rehabilitation (10 Sessions)"
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Clinical Recovery Goals *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Reduce pain VAS from 8/10 to < 2/10, restore active ROM, strengthen core stabilizers..."
                  value={planForm.goals}
                  onChange={(e) => setPlanForm({ ...planForm, goals: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Home Exercise Protocol</label>
                <input
                  type="text"
                  placeholder="e.g. Bridging, pelvic tilts, lumbar stretch 2x daily"
                  value={planForm.homeProgram}
                  onChange={(e) => setPlanForm({ ...planForm, homeProgram: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0f18] text-white border border-stone-700 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
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
                  <span>Activate Rehab Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PRINTABLE PROGRESS REPORT VIEW */}
      {selectedProgressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-stone-800 rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto print:bg-white print:text-black">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Physiotherapy Progress & Recovery Report</h3>
                  <p className="text-xs text-stone-400">SHREE MULTIDISCIPLINARY HEALTHCARE • Department of Physiotherapy</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setSelectedProgressModal(null)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="bg-[#0a0f18] p-4 rounded-xl border border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block font-medium">Patient Name:</span>
                <span className="font-bold text-white text-sm">{selectedProgressModal.patientName}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">UHID:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedProgressModal.patientUhid}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Age / Gender:</span>
                <span className="text-stone-200">{selectedProgressModal.age} yrs • {selectedProgressModal.gender}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Phone:</span>
                <span className="text-stone-200">{selectedProgressModal.phone}</span>
              </div>
            </div>

            {/* Treatment Summary */}
            <div className="space-y-3">
              <div className="border border-stone-800 rounded-xl p-4 bg-[#0a0f18]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">Rehabilitation Plan</h4>
                <div className="text-sm font-bold text-white">{selectedProgressModal.planTitle}</div>
                <div className="text-xs text-stone-300 mt-1">{selectedProgressModal.planGoals}</div>
              </div>

              <div className="border border-stone-800 rounded-xl p-4 bg-[#0a0f18]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Chronological Session Timeline ({selectedProgressModal.sessionsHistory?.length || 0} Sessions)
                </h4>
                <div className="space-y-2 mt-2">
                  {selectedProgressModal.sessionsHistory?.map((sess: any) => (
                    <div key={sess.id} className="p-3 bg-[#0e1626] rounded-lg border border-stone-800/80 text-xs">
                      <div className="flex items-center justify-between font-bold text-stone-200">
                        <span className="text-emerald-400">Session #{sess.sessionNumber}</span>
                        <span className="text-stone-400">
                          {new Date(sess.sessionDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-stone-300 mt-1">
                        <span className="font-semibold text-purple-400">Assessment: </span>
                        {sess.assessment}
                      </div>
                      <div className="text-stone-400 mt-0.5">
                        <span className="font-semibold text-amber-400">Plan: </span>
                        {sess.planNext}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-stone-800 pt-3 flex justify-between text-xs text-stone-500">
              <span>Shree Multidisciplinary Clinic • Freedom Hospitals, Mokila</span>
              <span>Authorized Clinical Physiotherapist & Rehabilitation Specialist</span>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT CLINICAL JOURNEY MODAL */}
      <PatientJourneyModal
        isOpen={selectedJourneyModal.isOpen}
        onClose={() => setSelectedJourneyModal({ isOpen: false })}
        identifier={selectedJourneyModal.identifier}
      />
    </div>
  );
};
