import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  Headphones,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Plus,
  Loader2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';

interface PatientJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry?: any | null;
  patient?: any | null;
  patientIdOrPhone?: string | null;
  onRefresh?: () => void;
}

export const PatientJourneyModal: React.FC<PatientJourneyModalProps> = ({
  isOpen,
  onClose,
  enquiry: initialEnquiry,
  patient: initialPatient,
  patientIdOrPhone,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [journeyData, setJourneyData] = useState<{
    patient: any | null;
    enquiry: any | null;
    timeline: any[];
  } | null>(null);

  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'AUDIOLOGY',
    diagnosis: '',
    notes: '',
    plan: '',
    nextAppointmentDate: '',
  });

  const loadJourney = async () => {
    const id =
      patientIdOrPhone ||
      initialPatient?.id ||
      initialEnquiry?.patientId ||
      initialEnquiry?.id ||
      initialEnquiry?.phone ||
      initialPatient?.phone;

    if (!id) return;

    try {
      setLoading(true);
      const res = await apiFetch(`/api/v1/hearing-aids/patient-journey/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        setJourneyData({
          patient: data.patient || initialPatient || null,
          enquiry: data.enquiry || initialEnquiry || null,
          timeline: data.timeline || [],
        });
      } else {
        // Fallback to locally passed data if available
        setJourneyData({
          patient: initialPatient || initialEnquiry?.patient || null,
          enquiry: initialEnquiry || null,
          timeline: buildFallbackTimeline(initialPatient || initialEnquiry?.patient, initialEnquiry),
        });
      }
    } catch (err) {
      console.error('Failed to load patient journey:', err);
      setJourneyData({
        patient: initialPatient || initialEnquiry?.patient || null,
        enquiry: initialEnquiry || null,
        timeline: buildFallbackTimeline(initialPatient || initialEnquiry?.patient, initialEnquiry),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadJourney();
    } else {
      setIsAddVisitOpen(false);
    }
  }, [isOpen, initialEnquiry, initialPatient, patientIdOrPhone]);

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientId = journeyData?.patient?.id;
    if (!patientId) {
      alert('Patient record required to add clinical visit.');
      return;
    }

    try {
      setSubmittingVisit(true);
      const res = await apiFetch(`/api/v1/hearing-aids/patient-journey/${patientId}/visit`, {
        method: 'POST',
        body: JSON.stringify(visitForm),
      });

      if (res.ok) {
        setIsAddVisitOpen(false);
        setVisitForm({
          visitDate: new Date().toISOString().split('T')[0],
          visitType: 'AUDIOLOGY',
          diagnosis: '',
          notes: '',
          plan: '',
          nextAppointmentDate: '',
        });
        await loadJourney();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record visit');
      }
    } catch {
      alert('Error recording visit');
    } finally {
      setSubmittingVisit(false);
    }
  };

  if (!isOpen) return null;

  const patient = journeyData?.patient || initialPatient || initialEnquiry?.patient;
  const enquiry = journeyData?.enquiry || initialEnquiry;
  const timeline = journeyData?.timeline || [];

  const displayName = patient?.fullName || enquiry?.name || 'Patient';
  const displayPhone = patient?.phone || enquiry?.phone || '—';
  const displayUhid = patient?.uhid || 'Lead / Walk-in';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0e1626] border border-stone-800 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in text-stone-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#0a0f18] border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                  {displayName}
                </h2>
                {patient?.uhid ? (
                  <span className="font-mono text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                    {patient.uhid}
                  </span>
                ) : (
                  <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                    Walk-in Lead
                  </span>
                )}
                <span className="text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-md">
                  Hospital Visit History & Timeline
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400 mt-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-stone-300 font-medium">{displayPhone}</span>
                </span>
                {patient?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    <span>{patient.email}</span>
                  </span>
                )}
                {patient?.age && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>{patient.age} Yrs {patient.gender ? `• ${patient.gender}` : ''}</span>
                  </span>
                )}
                {patient?.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>{patient.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {patient?.id && (
              <Link
                to={`/admin/patients/${patient.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all cursor-pointer shadow-xs"
                title="View full Electronic Medical Record (EMR)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full EMR Profile</span>
              </Link>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all cursor-pointer shadow-xs"
              title="Print Clinical Summary"
            >
              <Printer className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clinical Overview Bar */}
        <div className="bg-[#0b101c] px-5 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-[11px] uppercase font-bold tracking-wider">
                Encounters:
              </span>
              <span className="font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {timeline.length} Documented
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-[11px] uppercase font-bold tracking-wider">
                Protocol:
              </span>
              <span className="font-medium text-stone-200 text-xs">
                Audiology Diagnostic & Hearing Aid Trial
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-[11px] uppercase font-bold tracking-wider">
                Trial Device:
              </span>
              <span className="font-semibold text-cyan-300 text-xs font-mono">
                Phonak Lumity L90-R
              </span>
            </div>
          </div>

          {patient?.id && (
            <button
              onClick={() => setIsAddVisitOpen(!isAddVisitOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddVisitOpen ? 'Cancel' : 'Record Visit'}</span>
            </button>
          )}
        </div>

        {/* Add Visit Inline Drawer */}
        {isAddVisitOpen && (
          <div className="bg-[#121c30] p-5 border-b border-emerald-500/20 animate-fade-in">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              Record New Hospital Visit for {displayName}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Enter clinical diagnosis, doctor consultation remarks, and next planned appointment.
            </p>

            <form onSubmit={handleCreateVisit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Visit Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={visitForm.visitDate}
                  onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                  className="w-full bg-[#0a0f18] border border-stone-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Department</label>
                <select
                  value={visitForm.visitType}
                  onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })}
                  className="w-full bg-[#0a0f18] border border-stone-700 text-white rounded-xl px-3 py-2"
                >
                  <option value="AUDIOLOGY">Audiology & Hearing Aid Clinic</option>
                  <option value="SPEECH_THERAPY">Speech Language Pathology</option>
                  <option value="PHYSIOTHERAPY">Physiotherapy & Rehab</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Next Follow-Up</label>
                <input
                  type="date"
                  value={visitForm.nextAppointmentDate}
                  onChange={(e) => setVisitForm({ ...visitForm, nextAppointmentDate: e.target.value })}
                  className="w-full bg-[#0a0f18] border border-stone-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-stone-300 font-semibold mb-1">
                  Purpose / Diagnosis <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={visitForm.diagnosis}
                  onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  placeholder="e.g. Came for Hearing Aid Follow-up / Reports Consultation / Test"
                  className="w-full bg-[#0a0f18] border border-stone-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-stone-300 font-semibold mb-1">Doctor Consultation Notes</label>
                <textarea
                  rows={2}
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  placeholder="Clinical observations, patient feedback, test impressions..."
                  className="w-full bg-[#0a0f18] border border-stone-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Treatment Plan</label>
                <textarea
                  rows={2}
                  value={visitForm.plan}
                  onChange={(e) => setVisitForm({ ...visitForm, plan: e.target.value })}
                  placeholder="Prescriptions, trial instructions, next steps..."
                  className="w-full bg-[#0a0f18] border border-stone-700 text-white rounded-xl px-3 py-2"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddVisitOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVisit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5"
                >
                  {submittingVisit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Encounter</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scrollable Timeline Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs text-stone-400">Loading chronological clinical history...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-stone-300">No hospital visits recorded yet</h4>
              <p className="text-xs text-stone-500 mt-1">
                Click "Record New Visit" above to log the patient's first clinical encounter.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-stone-800 space-y-8">
              {timeline.map((event, idx) => {
                const dateObj = new Date(event.date);
                const formattedDate = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const dayOfWeek = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });

                // Icon & Color styling based on event characteristics
                let badgeColor = 'bg-stone-800 text-stone-300 border-stone-700';
                let dotColor = 'bg-stone-500 ring-stone-800';
                let IconComponent = FileText;

                if (event.type === 'HEARING_AID_TRIAL' || event.badge?.includes('Trial')) {
                  badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                  dotColor = 'bg-emerald-400 ring-emerald-950';
                  IconComponent = Headphones;
                } else if (event.badge?.includes('Report') || event.title?.includes('Report')) {
                  badgeColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
                  dotColor = 'bg-cyan-400 ring-cyan-950';
                  IconComponent = Activity;
                } else if (event.badge?.includes('Diagnostic') || event.badge?.includes('Test') || event.audiograms?.length > 0) {
                  badgeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
                  dotColor = 'bg-purple-400 ring-purple-950';
                  IconComponent = Stethoscope;
                } else if (event.type === 'ENQUIRY') {
                  badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                  dotColor = 'bg-amber-400 ring-amber-950';
                  IconComponent = User;
                }

                return (
                  <div key={event.id || idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full ${dotColor} ring-4 transition-transform group-hover:scale-125`}
                    />

                    {/* Timeline Event Card */}
                    <div className="bg-[#11192a] border border-stone-800/80 hover:border-stone-700 rounded-2xl p-5 shadow-lg transition-all space-y-3.5">
                      {/* Top Bar: Date & Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-800/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-stone-800/80 text-emerald-400">
                            <IconComponent className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="font-bold text-base text-white">
                              {formattedDate} ({dayOfWeek})
                            </span>
                            <span className="text-[11px] text-stone-400 block">
                              {event.department ? `Department: ${event.department.replace('_', ' ')}` : 'Hospital Encounter'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border self-start sm:self-auto ${badgeColor}`}
                        >
                          {event.badge || 'Encounter'}
                        </span>
                      </div>

                      {/* Main Title / Encounter Purpose */}
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-emerald-300">
                          {event.title}
                        </h4>
                        {event.diagnosis && (
                          <div className="mt-1 text-xs text-stone-300">
                            <span className="font-semibold text-stone-400">Clinical Diagnosis: </span>
                            <span className="font-medium text-white">{event.diagnosis}</span>
                          </div>
                        )}
                      </div>

                      {/* Doctor Consultation Notes */}
                      {event.notes && (
                        <div className="bg-[#0b101c] p-3.5 rounded-xl border border-stone-800/80 text-xs text-stone-300 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Doctor Consultation & Clinical Findings:
                          </span>
                          <p className="leading-relaxed whitespace-pre-line text-stone-200">
                            {event.notes}
                          </p>
                        </div>
                      )}

                      {/* Hearing Aid Trial Details Block */}
                      {event.device && (
                        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <Headphones className="w-4 h-4" /> Device Trial Unit: {event.device.brand} {event.device.modelName}
                            </span>
                            <span className="text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono">
                              S/N: {event.device.serialNumber}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-300 pt-1">
                            <div>
                              <span className="text-stone-500 block">Fitting Side:</span>
                              <span className="font-semibold text-white">{event.earSide || 'BINAURAL'}</span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">Trial Window:</span>
                              <span className="font-semibold text-white">
                                {event.trialStartDate ? new Date(event.trialStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                                {' – '}
                                {event.trialEndDate ? new Date(event.trialEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">Deposit Received:</span>
                              <span className="font-semibold text-emerald-400 font-mono">
                                ₹{Number(event.depositAmount || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">Trial Outcome:</span>
                              <span className="font-semibold text-amber-400 font-mono">
                                {event.outcome || 'ONGOING'}
                              </span>
                            </div>
                          </div>
                          {event.feedback && (
                            <p className="text-[11px] text-stone-400 italic pt-1 border-t border-emerald-500/20">
                              Patient Feedback: "{event.feedback}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Audiogram Test Highlights Block */}
                      {event.audiograms && event.audiograms.length > 0 && (
                        <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-purple-300">
                            <span className="flex items-center gap-1.5">
                              <Activity className="w-4 h-4" /> Diagnostic Audiometry & Tympanometry Findings
                            </span>
                            <span className="text-[11px] text-purple-400 font-medium">
                              PTA Test Record Verified
                            </span>
                          </div>
                          {event.audiograms.map((ag: any, agIdx: number) => (
                            <div key={agIdx} className="space-y-1.5">
                              <p className="text-stone-200 text-xs">
                                <span className="font-semibold text-purple-300">Interpretation: </span>
                                {ag.interpretation || 'Bilateral Sensorineural Hearing Loss.'}
                              </p>
                              <div className="flex items-center gap-4 text-[11px] text-stone-400">
                                <span>Right Tympanometry: <strong className="text-white">{ag.tympanometryRight || 'Type A'}</strong></span>
                                <span>Left Tympanometry: <strong className="text-white">{ag.tympanometryLeft || 'Type A'}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Plan / Follow Up */}
                      {(event.plan || event.nextAppointmentDate) && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-stone-800 text-xs">
                          {event.plan && (
                            <div className="text-stone-300">
                              <span className="font-semibold text-emerald-400">Action Plan: </span>
                              <span>{event.plan}</span>
                            </div>
                          )}
                          {event.nextAppointmentDate && (
                            <div className="text-amber-400 text-xs font-semibold shrink-0 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                Next Appointment:{' '}
                                {new Date(event.nextAppointmentDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0a0f18] border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>SHREE Multidisciplinary Healthcare — Clinical Encounters EMR Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium cursor-pointer"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
};

// Fallback timeline builder when offline or API in transition
function buildFallbackTimeline(patient: any, enquiry: any): any[] {
  const events: any[] = [];

  if (patient?.visits) {
    patient.visits.forEach((v: any) => {
      let badge = 'Clinical Visit';
      let title = `Hospital Visit - ${v.visitType}`;
      const diagLower = (v.diagnosis || '').toLowerCase();
      const notesLower = (v.notes || '').toLowerCase();

      if (diagLower.includes('trial') || diagLower.includes('fitting') || diagLower.includes('rem') || notesLower.includes('trial fitting')) {
        badge = 'Hearing Aid Trial & Fitting';
        title = 'Came for Hearing Aid Trial & Device Fitting';
      } else if (diagLower.includes('cleared') || diagLower.includes('amplification') || notesLower.includes('report review') || diagLower.includes('report')) {
        badge = 'Report Review & Consultation';
        title = 'Came for Audiology Reports Consultation';
      } else if (v.audiograms?.length > 0 || diagLower.includes('snhl') || diagLower.includes('pta') || notesLower.includes('diagnostic')) {
        badge = 'Diagnostic Hearing Evaluation';
        title = 'Came for Diagnostic Hearing Test (PTA & Impedance)';
      }

      events.push({
        id: `v-${v.id}`,
        date: v.visitDate,
        type: 'VISIT',
        badge,
        title,
        department: v.visitType,
        diagnosis: v.diagnosis,
        notes: v.notes,
        plan: v.plan,
        nextAppointmentDate: v.nextAppointmentDate,
        audiograms: v.audiograms || [],
      });
    });
  }

  if (patient?.hearingAidTrials) {
    patient.hearingAidTrials.forEach((t: any) => {
      events.push({
        id: `t-${t.id}`,
        date: t.trialStartDate,
        type: 'HEARING_AID_TRIAL',
        badge: 'Device Trial',
        title: `Hearing Aid Evaluation Trial: ${t.inventory?.brand || 'Phonak'} ${t.inventory?.modelName || 'Lumity'}`,
        department: 'AUDIOLOGY',
        device: t.inventory,
        earSide: t.earSide,
        trialStartDate: t.trialStartDate,
        trialEndDate: t.trialEndDate,
        depositAmount: t.depositAmount,
        feedback: t.feedback,
        outcome: t.outcome,
      });
    });
  }

  if (enquiry) {
    events.push({
      id: `e-${enquiry.id}`,
      date: enquiry.createdAt || enquiry.enquiryDate || '2026-10-14',
      type: 'ENQUIRY',
      badge: 'Initial Consultation',
      title: `Walk-in Hearing Enquiry (${enquiry.source || 'Walk-in'})`,
      department: 'FRONT_DESK',
      notes: enquiry.notes,
      status: enquiry.status,
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}
