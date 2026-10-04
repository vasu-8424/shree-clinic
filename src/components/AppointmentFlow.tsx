import React, { useState, useEffect } from 'react';

export interface AppointmentRecord {
  id: string;
  patientAgeGroup: 'Child' | 'Adult' | 'Senior';
  service: string;
  patientName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  concern: string;
  createdAt: string;
}

interface AppointmentFlowProps {
  initialService?: string;
  onSuccess?: (record: AppointmentRecord) => void;
}

export const AppointmentFlow: React.FC<AppointmentFlowProps> = ({
  initialService = 'Audiology',
  onSuccess
}) => {
  const [step, setStep] = useState<number>(1);
  const [patientAgeGroup, setPatientAgeGroup] = useState<'Child' | 'Adult' | 'Senior'>('Adult');
  const [service, setService] = useState<string>(initialService || 'Audiology');
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('Morning (09:00 AM – 12:00 PM)');
  const [concern, setConcern] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<AppointmentRecord | null>(null);

  useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const handleNext = () => {
    setErrorMsg('');

    if (step === 3 && !patientName.trim()) {
      setErrorMsg('Please enter your full name to proceed.');
      return;
    }

    if (step === 4 && (!phone.trim() || phone.length < 8)) {
      setErrorMsg('Please enter a valid phone number for consultation coordination.');
      return;
    }

    if (step === 5 && !preferredDate) {
      setErrorMsg('Please select a preferred consultation date.');
      return;
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const record: AppointmentRecord = {
        id: `SHREE-${Date.now().toString().slice(-6)}`,
        patientAgeGroup,
        service,
        patientName,
        phone,
        preferredDate,
        preferredTime,
        concern: concern || 'General assessment request',
        createdAt: new Date().toISOString()
      };

      try {
        const stored = JSON.parse(localStorage.getItem('shree_appointments') || '[]');
        stored.push(record);
        localStorage.setItem('shree_appointments', JSON.stringify(stored));
      } catch {
        // storage fallback
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      setSubmittedData(record);
      if (onSuccess) onSuccess(record);
    }, 700);
  };

  const handleReset = () => {
    setStep(1);
    setIsSubmitted(false);
    setSubmittedData(null);
    setPatientName('');
    setPhone('');
    setPreferredDate('');
    setConcern('');
  };

  return (
    <section
      id="booking"
      className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 bg-[#0b3037] text-[#f7f4ec] relative overflow-hidden"
      aria-label="Appointment Experience"
    >
      {/* Background Golden Radial Glow */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-[#d9ae4a]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading (Section 32) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d9ae4a]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase font-body text-[#d9ae4a]">
                Direct Clinical Intake
              </span>
            </div>

            <h2
              className="text-[#f7f4ec] font-heading font-extrabold tracking-tight mb-6"
              style={{
                fontSize: 'clamp(3rem, 7vw, 6rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.05em'
              }}
            >
              LET'S START <br />
              <span className="text-[#d9ae4a] font-editorial italic font-normal">your journey.</span>
            </h2>

            <p className="text-base text-[#f7f4ec]/80 font-body leading-relaxed mb-8 max-w-md">
              A structured, sequential consultation intake ensuring your care is aligned with the appropriate clinical discipline from the first visit.
            </p>

            {/* Stepper overview */}
            <div className="p-6 rounded-[24px] bg-[#123f48]/50 border border-[#f7f4ec]/10 space-y-3 text-xs text-[#f7f4ec]/70">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#d9ae4a]">STEP 0{step} OF 07</span>
                <span className="uppercase tracking-widest font-semibold">
                  {step === 1 && 'Who are we caring for?'}
                  {step === 2 && 'What can we help with?'}
                  {step === 3 && 'Full Name'}
                  {step === 4 && 'Contact Phone'}
                  {step === 5 && 'Preferred Date'}
                  {step === 6 && 'Preferred Time'}
                  {step === 7 && 'Specific Concern'}
                </span>
              </div>
              <div className="w-full h-1 bg-[#f7f4ec]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d9ae4a] transition-all duration-300"
                  style={{ width: `${(step / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Full-Screen Sequential Flow Experience (Section 32) */}
          <div className="lg:col-span-7 bg-[#f7f4ec] text-[#0b3037] rounded-[32px] p-6 sm:p-12 border border-[#f7f4ec]/20 shadow-2xl relative min-h-[460px] flex flex-col justify-between">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
                {errorMsg}
              </div>
            )}

            <div>
              {/* STEP 01: Who are we caring for? */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 01
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      Who are we caring for?
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['Child', 'Adult', 'Senior'] as const).map((group) => (
                      <button
                        type="button"
                        key={group}
                        onClick={() => setPatientAgeGroup(group)}
                        className={`p-6 rounded-[22px] border text-left transition-all ${
                          patientAgeGroup === group
                            ? 'bg-[#0b3037] text-[#f7f4ec] border-[#0b3037] shadow-md scale-102'
                            : 'bg-[#eee9dc]/60 text-[#0b3037] border-[#123f48]/10 hover:border-[#123f48]/30'
                        }`}
                      >
                        <span className="text-xl font-heading font-extrabold block mb-1">
                          {group}
                        </span>
                        <span className={`text-xs block ${patientAgeGroup === group ? 'text-[#d9ae4a]' : 'text-[#12333a]/60'}`}>
                          {group === 'Child' && 'Pediatric milestones'}
                          {group === 'Adult' && 'Hearing & recovery'}
                          {group === 'Senior' && 'Balance & independence'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 02: What can we help with? */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 02
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      What can we help with?
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Audiology', 'Speech Therapy', 'Physiotherapy', 'Not Sure'].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setService(item)}
                        className={`p-5 rounded-[22px] border text-left transition-all ${
                          service === item
                            ? 'bg-[#0b3037] text-[#f7f4ec] border-[#0b3037] shadow-md'
                            : 'bg-[#eee9dc]/60 text-[#0b3037] border-[#123f48]/10 hover:border-[#123f48]/30'
                        }`}
                      >
                        <span className="text-base font-heading font-bold block mb-1">
                          {item}
                        </span>
                        <span className={`text-xs block ${service === item ? 'text-[#d9ae4a]' : 'text-[#12333a]/60'}`}>
                          {item === 'Audiology' && 'Hearing tests, audiometry & aids'}
                          {item === 'Speech Therapy' && 'Speech delay, stuttering & voice'}
                          {item === 'Physiotherapy' && 'Joints, neuro-rehab & mobility'}
                          {item === 'Not Sure' && 'Multidisciplinary guidance'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 03: Name */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 03
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      Patient or Guardian Full Name
                    </h3>
                  </div>

                  <div>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. Anand K. Verma"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-[#123f48]/20 bg-[#f7f4ec] text-base font-body focus:border-[#0b3037] focus:ring-2 focus:ring-[#0b3037]/10 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 04: Phone */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 04
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      Direct Telephone or WhatsApp
                    </h3>
                  </div>

                  <div>
                    <input
                      type="tel"
                      autoFocus
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-[#123f48]/20 bg-[#f7f4ec] text-base font-body focus:border-[#0b3037] focus:ring-2 focus:ring-[#0b3037]/10 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 05: Preferred Date */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 05
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      Preferred Date
                    </h3>
                  </div>

                  <div>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-[#123f48]/20 bg-[#f7f4ec] text-base font-body focus:border-[#0b3037] focus:ring-2 focus:ring-[#0b3037]/10 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 06: Preferred Time */}
              {step === 6 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 06
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      Preferred Time Window
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Morning (09:00 AM – 12:00 PM)',
                      'Afternoon (12:00 PM – 04:00 PM)',
                      'Evening (04:00 PM – 07:00 PM)',
                      'Earliest Slot Available'
                    ].map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setPreferredTime(slot)}
                        className={`p-4 rounded-xl border text-xs text-left font-body font-semibold transition-all ${
                          preferredTime === slot
                            ? 'bg-[#0b3037] text-[#f7f4ec] border-[#0b3037]'
                            : 'bg-[#eee9dc]/60 text-[#0b3037] border-[#123f48]/10 hover:border-[#123f48]/30'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 07: Concern */}
              {step === 7 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
                      STEP 07
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037]">
                      Primary Concern or Symptoms
                    </h3>
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="Please note any specific symptoms, difficulties in hearing/speaking/moving, or prior clinical records..."
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border border-[#123f48]/20 bg-[#f7f4ec] text-base font-body focus:border-[#0b3037] focus:ring-2 focus:ring-[#0b3037]/10 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation and Final Submit CTA */}
            <div className="pt-8 border-t border-[#123f48]/10 flex items-center justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-full border border-[#123f48]/20 text-xs font-heading font-bold text-[#0b3037] hover:bg-black/5 transition-colors"
                >
                  ← Previous
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-full bg-[#0b3037] hover:bg-[#123f48] text-[#f7f4ec] font-heading font-bold text-sm shadow-lg flex items-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {step < 7 ? (
                  <>
                    <span>Next Step</span>
                    <span className="text-[#d9ae4a]">→</span>
                  </>
                ) : isSubmitting ? (
                  <span>Recording Request...</span>
                ) : (
                  <>
                    <span>REQUEST APPOINTMENT</span>
                    <span className="text-[#d9ae4a]">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN CREAM OVERLAY: APPOINTMENT SUCCESS (Section 33) */}
      {isSubmitted && (
        <div
          className="fixed inset-0 z-[100] bg-[#f7f4ec] text-[#0b3037] flex flex-col items-center justify-center p-6 text-center animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          {/* Large Gold Check */}
          <div className="w-24 h-24 rounded-full bg-[#d9ae4a]/20 border-2 border-[#d9ae4a] flex items-center justify-center mb-8 shadow-xl">
            <svg className="w-12 h-12 text-[#d9ae4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Heading (Section 33: REQUEST RECEIVED.) */}
          <h2
            className="font-heading font-extrabold tracking-tight text-[#0b3037] mb-4"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 0.95
            }}
          >
            REQUEST RECEIVED.
          </h2>

          <p className="text-lg sm:text-xl text-[#12333a]/80 font-body max-w-lg mb-8">
            Our team will contact you shortly.
          </p>

          {/* Summary Box */}
          <div className="p-6 rounded-[24px] bg-[#eee9dc] border border-[#123f48]/10 max-w-md w-full text-left text-xs font-body space-y-2 mb-8 text-[#0b3037]">
            <div className="flex justify-between">
              <span className="font-semibold text-[#12333a]/70">Reference Code:</span>
              <span className="font-mono font-bold text-[#0b3037]">{submittedData?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#12333a]/70">Patient:</span>
              <span className="font-bold">{submittedData?.patientName} ({submittedData?.patientAgeGroup})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#12333a]/70">Specialty:</span>
              <span className="font-bold">{submittedData?.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#12333a]/70">Schedule Request:</span>
              <span>{submittedData?.preferredDate} · {submittedData?.preferredTime}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-8 py-3.5 rounded-full bg-[#0b3037] text-[#f7f4ec] font-heading font-bold text-xs sm:text-sm hover:bg-[#123f48] transition-colors shadow-md"
          >
            Return to Main Website
          </button>
        </div>
      )}
    </section>
  );
};
