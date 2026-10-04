import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// REAL HEALTHCARE PHOTOGRAPHY (from internet)
// Tailored to Audiology, Speech Therapy, and Physiotherapy
// ==========================================
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1280&q=85';

const SECTION2_IMAGE =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1280&q=85';

const SECTION3_IMG1 =
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=85';

const SECTION3_IMG2 =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=85';

const SECTION3_BG =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1280&q=85';

// ==========================================
// DATA CONSTANTS (SHREE MULTIDISCIPLINARY CLINIC)
// Clear, simple, patient-centered descriptions
// ==========================================
const featureBars = [
  '01. Audiology & Hearing Diagnostics',
  '02. Speech, Voice & Swallowing Therapy',
  '03. Physical & Neurological Rehabilitation'
];

interface ServiceItem {
  id: string;
  name: string;
  num: string | null;
  active: boolean;
  plainEnglishSummary: string;
  whoItHelps: string;
  keyTreatments: string[];
}

const initialServices: ServiceItem[] = [
  {
    id: 'audiology',
    name: 'Audiology &\nHearing Care',
    num: '01',
    active: true,
    plainEnglishSummary:
      'We test how well you hear sound and speech in quiet and noisy rooms. If you have hearing loss, we fit and verify digital hearing aids tailored to your ears.',
    whoItHelps: 'Children with hearing delay, working adults struggling in meetings, and seniors wanting clear conversations.',
    keyTreatments: [
      'Pure Tone Audiometry (PTA) — Finds the softest sounds you can hear',
      'Speech Audiometry — Tests how clearly you understand words',
      'Tympanometry — Checks ear drum pressure and fluid buildup',
      'OAE Newborn Screening — Early hearing check for babies',
      'Hearing Aid Trial & Fitting — Real-ear calibrated hearing devices',
      'Walk-In Device Care — Cleaning, tuning, and instant repairs'
    ]
  },
  {
    id: 'speech',
    name: 'Speech &\nLanguage Therapy',
    num: '02',
    active: false,
    plainEnglishSummary:
      'We help children and adults communicate clearly. This includes teaching children first words, correcting stammers, treating vocal fatigue, and helping stroke survivors regain speech and swallow safely.',
    whoItHelps: 'Toddlers not speaking yet, school children who stutter, singers with voice strain, and stroke survivors.',
    keyTreatments: [
      'Speech Delay Therapy — Building vocabulary and clear sentences',
      'Articulation Therapy — Correcting sound pronunciation',
      'Stuttering & Fluency Therapy — Smooth, tension-free speech techniques',
      'Voice Therapy — Relieving vocal strain, hoarseness, and fatigue',
      'Aphasia Rehabilitation — Restoring language after stroke',
      'VitalStim® Swallowing Therapy — Electrical stimulation for safe swallowing'
    ]
  },
  {
    id: 'physio',
    name: 'Physiotherapy &\nRehabilitation',
    num: '03',
    active: false,
    plainEnglishSummary:
      'We treat back pain, joint stiffness, sports injuries, and neurological conditions like stroke and Parkinson’s to restore your walking, balance, and independence.',
    whoItHelps: 'People with chronic back pain, post-surgery patients, seniors worried about falling, and children with motor delays.',
    keyTreatments: [
      'Spine & Joint Physiotherapy — Relieving neck, back, and knee pain',
      'Neuro Rehabilitation — Retraining balance and walking after stroke',
      'Pediatric Physiotherapy — Helping babies sit, crawl, and walk',
      'Geriatric Balance Training — Fall prevention and muscle strength',
      'Post-Surgery Recovery — Step-by-step healing after joint surgery',
      'Home Visit Physiotherapy — For bed-bound or acute patients'
    ]
  },
  {
    id: 'rehab',
    name: 'Integrated\nNeuro Rehab',
    num: null,
    active: false,
    plainEnglishSummary:
      'When conditions affect both movement and speech (such as stroke or child development delays), our audiologists, speech pathologists, and physiotherapists work together as one team.',
    whoItHelps: 'Stroke patients needing speech, swallowing, and walking therapy together, and children with developmental needs.',
    keyTreatments: [
      'Unified Stroke Recovery Roadmap',
      'Child Developmental Milestone Team Assessment',
      'Elderly Independence & Balance Program',
      'Family Home Care Coaching'
    ]
  }
];

const faqs = [
  {
    q: 'What healthcare services does SHREE provide?',
    a: 'SHREE is a multidisciplinary clinic that specializes in three core healthcare fields: 1) Audiology (Hearing tests and hearing aids), 2) Speech Therapy (Speech delays, stuttering, voice issues, and swallowing difficulties), and 3) Physiotherapy (Back/joint pain, stroke recovery, balance, and child motor therapy).'
  },
  {
    q: 'Do I need a doctor referral to book an appointment?',
    a: 'No prior doctor referral is required. You can book directly with us for an initial clinical assessment. However, if you already have physician notes, scans, or audiograms, please bring them along to your first consultation.'
  },
  {
    q: 'What age groups do your clinicians treat?',
    a: 'We treat all ages: infants and young children (pediatric speech delay, newborn hearing checks, motor delays), working adults (hearing health, voice therapy, back pain), and seniors (hearing aids, balance, and post-stroke recovery).'
  },
  {
    q: 'What happens during a hearing test?',
    a: 'Your visit begins with a gentle inspection of your ear canal. Next, you sit inside our quiet acoustic sound booth wearing comfortable headphones. You listen to different sound tones and words, indicating the softest sounds you can detect. Your audiologist explains your results immediately in plain language.'
  },
  {
    q: 'How does speech therapy help children with speech delay?',
    a: 'Our speech therapists use engaging, play-based activities to encourage children to imitate sounds, expand vocabulary, and speak in full sentences. Parents are actively included in sessions so you learn simple strategies to practice at home.'
  },
  {
    q: 'How many therapy sessions will I need?',
    a: 'The number of sessions depends on your specific condition and starting point. After your initial evaluation, your specialist provides a clear, estimated treatment plan with realistic goals and regular progress check-ins.'
  },
  {
    q: 'Do you offer home visits for elderly or bed-bound patients?',
    a: 'Yes, home physiotherapy visits are available for patients who are unable to travel due to recent surgery, severe pain, or mobility limitations. Availability depends on location; please contact our care desk to confirm.'
  },
  {
    q: 'Can I speak with a clinician before scheduling an appointment?',
    a: 'Yes. Our clinical care team is available by telephone or WhatsApp to listen to your concerns, answer questions, and guide you to the most suitable department.'
  }
];

// ==========================================
// CORE RESIZE & MASKING HOOKS
// ==========================================
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const check = () => setIsMobile(mql.matches);
    check();
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, []);
  return isMobile;
}

interface MaskPosition {
  x: number;
  y: number;
  sw: number;
  sh: number;
}

function useMaskPositions(
  sectionRef: React.RefObject<HTMLElement | null>,
  cardRefs: React.MutableRefObject<(HTMLElement | null)[]>
) {
  const [positions, setPositions] = useState<MaskPosition[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      const sRect = section.getBoundingClientRect();
      const nextPositions: MaskPosition[] = cardRefs.current.map((card) => {
        if (!card) return { x: 0, y: 0, sw: sRect.width, sh: sRect.height };
        const cRect = card.getBoundingClientRect();
        return {
          x: cRect.left - sRect.left,
          y: cRect.top - sRect.top,
          sw: sRect.width,
          sh: sRect.height
        };
      });
      setPositions(nextPositions);
    };

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(section);
    measure();

    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [sectionRef, cardRefs]);

  return positions;
}

interface ImageDimensions {
  width: number;
  height: number;
}

function useImageDimensions(imgUrl: string) {
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 1920, height: 1080 });

  useEffect(() => {
    const img = new Image();
    img.src = imgUrl;

    const compute = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };

    img.onload = compute;
    if (img.complete && img.naturalWidth) compute();
  }, [imgUrl]);

  return dimensions;
}

function useStaggeredReveal(threshold: number = 0.15) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getAnimStyle = (index: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`
  });

  return { containerRef, getAnimStyle, visible };
}

// ==========================================
// MASKED CARD COMPONENT (Full Coverage Across All Displays)
// ==========================================
interface MaskedCardProps {
  bgImage: string;
  position?: MaskPosition;
  imageDimensions: ImageDimensions;
  focalX: number;
  className?: string;
  children?: React.ReactNode;
  cardRef?: (el: HTMLElement | null) => void;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const MaskedCard: React.FC<MaskedCardProps> = ({
  bgImage,
  position,
  imageDimensions,
  focalX,
  className = '',
  children,
  cardRef,
  style = {},
  onClick
}) => {
  let maskStyle: React.CSSProperties = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (
    position &&
    position.sw > 0 &&
    position.sh > 0 &&
    imageDimensions.width > 0 &&
    imageDimensions.height > 0
  ) {
    // Calculate scale so the image covers BOTH sw and sh completely (no empty right or bottom space)
    const scale = Math.max(
      position.sw / imageDimensions.width,
      position.sh / imageDimensions.height
    );

    const scaledW = Math.ceil(imageDimensions.width * scale);
    const scaledH = Math.ceil(imageDimensions.height * scale);

    const overflowX = Math.max(0, scaledW - position.sw);
    const overflowY = Math.max(0, scaledH - position.sh);

    const focalOffsetX = overflowX * focalX;
    const focalOffsetY = overflowY * 0.4;

    const bgPosX = Math.round(-(position.x + focalOffsetX));
    const bgPosY = Math.round(-(position.y + focalOffsetY));

    maskStyle = {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: `${scaledW}px ${scaledH}px`,
      backgroundPosition: `${bgPosX}px ${bgPosY}px`,
      backgroundRepeat: 'no-repeat'
    };
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{ ...maskStyle, ...style }}
      className={`rounded-xl md:rounded-2xl overflow-hidden relative ${className}`}
    >
      {children}
    </div>
  );
};

// ==========================================
// SPLASH SCREEN (0-100 COUNTER)
// ==========================================
interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const stepDuration = 20; // 20ms * 100 steps = 2000ms
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, stepDuration);

    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 2200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2900);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex flex-col justify-between transition-opacity duration-700 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading Splash"
    >
      <div className="p-6 md:p-10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none text-black">
            SHREE
          </span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 uppercase tracking-widest text-neutral-500">
            Multidisciplinary Clinic · Audiology · Speech · Physiotherapy
          </span>
        </div>
        <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
          Quality Healthcare
        </span>
      </div>

      <div className="flex items-end justify-start">
        <span className="text-7xl md:text-9xl font-bold tabular-nums p-6 md:p-10 leading-none text-black">
          {count}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// FIXED NAVBAR & MOBILE MENU
// ==========================================
interface NavbarProps {
  onBookClick: () => void;
  onMenuToggle: () => void;
  mobileMenuOpen: boolean;
  onCloseMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onBookClick,
  onMenuToggle,
  mobileMenuOpen,
  onCloseMenu
}) => {
  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Rehabilitation', href: '#rehabilitation' },
    { label: 'Procedures', href: '#procedures' },
    { label: 'FAQs', href: '#faqs' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-all">
        {/* Logo (left side): Stacked with tight negative margin */}
        <a href="#home" className="flex flex-col select-none group">
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none text-black">
            SHREE
          </span>
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none text-black -mt-1.5 md:-mt-2">
            CLINIC
          </span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2 uppercase tracking-widest text-neutral-600">
            multidisciplinary healthcare
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={onMenuToggle}
            className="px-6 py-3 bg-white rounded-full border border-black text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors duration-200"
          >
            Menu
          </button>
          <a
            href="tel:+91"
            className="text-sm font-semibold text-black hover:underline"
          >
            Care Desk: +91 [CONTACT REQUIRED]
          </a>
          <button
            onClick={onBookClick}
            className="px-6 py-3 bg-black rounded-full text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile Hamburger (3 spans) */}
        <button
          onClick={onMenuToggle}
          className="md:hidden w-10 h-10 flex items-center justify-center relative focus:outline-none"
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
            }`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
            }`}
          />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div onClick={onCloseMenu} className="absolute inset-0 bg-black/25 backdrop-blur-sm" />

        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] flex flex-col justify-between p-8 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-5 pt-12">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={onCloseMenu}
                style={{
                  transitionDelay: mobileMenuOpen ? `${100 + i * 50}ms` : '0ms'
                }}
                className={`text-3xl font-bold text-black hover:text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-8 border-t border-neutral-200">
            <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Direct Clinical Assistance
            </p>
            <p className="text-sm font-semibold text-black mb-4">
              Mon–Sat: 09:00 AM – 07:00 PM
            </p>
            <button
              onClick={() => {
                onCloseMenu();
                onBookClick();
              }}
              className="w-full px-6 py-4 bg-black rounded-full text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Book Consultation →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// APPOINTMENT BOOKING MODAL (7-Step Flow)
// Clear, simple instructions with zero jargon
// ==========================================
interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedService = 'Audiology & Hearing Care'
}) => {
  const [step, setStep] = useState(1);
  const [careTarget, setCareTarget] = useState<'Child' | 'Adult' | 'Senior'>('Adult');
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('Morning (09:00 AM – 12:00 PM)');
  const [concern, setConcern] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedService(preselectedService);
    } else {
      document.body.style.overflow = '';
      setSubmitted(false);
      setStep(1);
      setErrorMsg('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preselectedService]);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMsg('');
    if (step === 3 && !name.trim()) {
      setErrorMsg('Please enter the patient or guardian full name.');
      return;
    }
    if (step === 4 && (!phone.trim() || phone.length < 8)) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }
    if (step === 5 && !date) {
      setErrorMsg('Please choose your preferred appointment date.');
      return;
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-xl w-full p-6 md:p-10 shadow-2xl relative border border-neutral-200 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center font-bold text-black text-sm"
          aria-label="Close"
        >
          ✕
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
              <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
                STEP 0{step} OF 07
              </span>
              <span className="text-xs font-semibold text-black uppercase">
                Clinical Consultation Request
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {errorMsg}
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  Who is the appointment for?
                </h3>
                <p className="text-xs text-neutral-600 mb-5">
                  Select the patient's age category so we can assign the right clinical specialist:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Child', 'Adult', 'Senior'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCareTarget(t)}
                      className={`p-4 rounded-xl border text-left font-bold transition-all ${
                        careTarget === t
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-stone-50 text-black border-neutral-200 hover:border-black'
                      }`}
                    >
                      <span className="block text-lg">{t}</span>
                      <span className="text-xs font-normal opacity-75 block mt-1">
                        {t === 'Child' && 'Speech delay & motor milestones'}
                        {t === 'Adult' && 'Hearing, voice & pain relief'}
                        {t === 'Senior' && 'Hearing aids, stroke & balance'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  Which clinical service do you need?
                </h3>
                <p className="text-xs text-neutral-600 mb-5">
                  Choose the primary area of care or choose "Not Sure" if you want general guidance:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Audiology & Hearing Care', desc: 'Hearing tests, audiometry & hearing aid fittings' },
                    { title: 'Speech & Language Therapy', desc: 'Speech delays, stammering, voice strain & swallowing' },
                    { title: 'Physiotherapy & Mobility', desc: 'Back pain, joint stiffness, walking & stroke recovery' },
                    { title: 'Not Sure (Need Assessment)', desc: 'General multidisciplinary consultation' }
                  ].map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => setSelectedService(s.title)}
                      className={`p-4 rounded-xl border text-left font-bold transition-all ${
                        selectedService === s.title
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-stone-50 text-black border-neutral-200 hover:border-black'
                      }`}
                    >
                      <span className="block text-base">{s.title}</span>
                      <span className="block text-xs font-normal opacity-70 mt-1">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  Patient or Guardian Full Name
                </h3>
                <p className="text-xs text-neutral-600 mb-4">
                  Please provide the name of the person seeking therapy or their parent/guardian:
                </p>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl border border-neutral-300 text-base font-semibold focus:border-black outline-none"
                />
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  Contact Phone Number
                </h3>
                <p className="text-xs text-neutral-600 mb-4">
                  We will call or WhatsApp this number to confirm the specialist's available times:
                </p>
                <input
                  type="tel"
                  autoFocus
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 rounded-xl border border-neutral-300 text-base font-semibold focus:border-black outline-none"
                />
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  Preferred Appointment Date
                </h3>
                <p className="text-xs text-neutral-600 mb-4">
                  Select which day you would prefer to come to the clinic:
                </p>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 rounded-xl border border-neutral-300 text-base font-semibold focus:border-black outline-none"
                />
              </div>
            )}

            {step === 6 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  Preferred Time of Day
                </h3>
                <p className="text-xs text-neutral-600 mb-4">
                  Choose the most convenient time window for your visit:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Morning (09:00 AM – 12:00 PM)',
                    'Afternoon (12:00 PM – 04:00 PM)',
                    'Evening (04:00 PM – 07:00 PM)',
                    'Earliest Available Appointment'
                  ].map((tm) => (
                    <button
                      key={tm}
                      type="button"
                      onClick={() => setTime(tm)}
                      className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        time === tm
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-stone-50 text-black border-neutral-200 hover:border-black'
                      }`}
                    >
                      {tm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  What concern brings you to SHREE?
                </h3>
                <p className="text-xs text-neutral-600 mb-4">
                  Briefly describe symptoms, how long you have experienced them, or any prior treatments:
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. Difficulty hearing conversations in busy places; or 2.5-year-old child not speaking words yet; or back pain after sitting..."
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  className="w-full p-4 rounded-xl border border-neutral-300 text-sm font-semibold focus:border-black outline-none"
                />
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-full border border-black text-xs font-bold text-black hover:bg-neutral-100"
                >
                  ← Previous
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-full bg-black text-white text-xs md:text-sm font-bold hover:bg-neutral-800 transition-colors shadow-md"
              >
                {step < 7 ? 'Next Step →' : 'REQUEST APPOINTMENT →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-3xl font-bold text-black mb-2">
              REQUEST RECEIVED.
            </h3>
            <p className="text-sm text-neutral-700 max-w-md mx-auto mb-6 leading-relaxed">
              Thank you, <strong className="text-black">{name || 'Patient'}</strong>. We have logged your request. Our clinical care coordinator will call or message you shortly at <strong className="text-black">{phone}</strong> to confirm your appointment time.
            </p>

            <div className="p-4 rounded-xl bg-stone-50 border border-neutral-200 text-left text-xs space-y-1.5 mb-6 text-black max-w-sm mx-auto">
              <div><strong>Patient Group:</strong> {careTarget}</div>
              <div><strong>Service:</strong> {selectedService}</div>
              <div><strong>Preferred Schedule:</strong> {date || 'First Available'} ({time})</div>
              <div><strong>Status:</strong> Pending Clinical Review</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeServices, setActiveServices] = useState<ServiceItem[]>(initialServices);

  const isMobile = useIsMobile();

  // Section 1 Mask positions & dimensions
  const section1Ref = useRef<HTMLElement | null>(null);
  const s1CardRefs = useRef<(HTMLElement | null)[]>([]);
  const s1Positions = useMaskPositions(section1Ref, s1CardRefs);
  const s1ImageDimensions = useImageDimensions(HERO_IMAGE);
  const s1Reveal = useStaggeredReveal(0.1);

  // Section 2 Mask positions & dimensions
  const section2Ref = useRef<HTMLElement | null>(null);
  const s2CardRefs = useRef<(HTMLElement | null)[]>([]);
  const s2Positions = useMaskPositions(section2Ref, s2CardRefs);
  const s2ImageDimensions = useImageDimensions(SECTION2_IMAGE);
  const s2Reveal = useStaggeredReveal(0.1);

  // Section 3 Reveal
  const s3Reveal = useStaggeredReveal(0.1);

  const handleSelectService = (index: number) => {
    setActiveServices((prev) =>
      prev.map((s, idx) => ({
        ...s,
        active: idx === index
      }))
    );
  };

  const activeServiceData = activeServices.find((s) => s.active) || activeServices[0];

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      {/* 01. SPLASH SCREEN (0-100 Counter) */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* 02. FIXED NAVBAR */}
      <Navbar
        onBookClick={() => setBookingModalOpen(true)}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMenu={() => setMobileMenuOpen(false)}
      />

      {/* 03. APPOINTMENT INTAKE MODAL */}
      <AppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedService={activeServiceData.name.replace('\n', ' ')}
      />

      {/* ======================================================== */}
      {/* SECTION 1 - HERO (Multidisciplinary Healthcare Clinic)   */}
      {/* ======================================================== */}
      <section
        id="home"
        ref={(el) => {
          section1Ref.current = el;
          s1Reveal.containerRef.current = el;
        }}
        className="min-h-screen md:h-screen w-full flex flex-col pt-24 md:pt-20 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
      >
        {/* 3 Clinical Feature Bars */}
        {featureBars.map((text, i) => (
          <MaskedCard
            key={i}
            cardRef={(el) => {
              s1CardRefs.current[i] = el;
            }}
            bgImage={HERO_IMAGE}
            position={s1Positions[i]}
            imageDimensions={s1ImageDimensions}
            focalX={isMobile ? 0.7 : 0.8}
            style={s1Reveal.getAnimStyle(i)}
            className="w-full h-11 md:h-13 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200/40"
          >
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
            <span className="flex items-center justify-center h-full text-black text-sm md:text-xl font-bold text-center relative z-10 px-4 tracking-tight">
              {text}
            </span>
          </MaskedCard>
        ))}

        {/* Main Hero Card (Card index 3) */}
        <MaskedCard
          cardRef={(el) => {
            s1CardRefs.current[3] = el;
          }}
          bgImage={HERO_IMAGE}
          position={s1Positions[3]}
          imageDimensions={s1ImageDimensions}
          focalX={isMobile ? 0.7 : 0.8}
          style={s1Reveal.getAnimStyle(3)}
          className="w-full flex-1 min-h-[360px] md:min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200/50"
        >
          {/* Readability gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/20 to-white/50 pointer-events-none" />

          {/* Structured flex content container that prevents any overlapping */}
          <div className="relative z-10 h-full p-5 md:p-8 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <p className="text-black text-xs md:text-sm font-semibold leading-relaxed max-w-[280px] md:max-w-md bg-white/80 backdrop-blur-sm p-2.5 rounded-lg border border-neutral-200/40">
                Dedicated clinical care for children, adults & seniors
                combining audiology, speech & physical rehabilitation.
              </p>
              <span className="text-black text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 shadow-sm w-fit shrink-0">
                Direct Consultation Intake
              </span>
            </div>

            {/* Bottom row */}
            <div className="pt-6">
              <span className="block text-black text-xs md:text-sm font-semibold tracking-wider uppercase mb-1.5">
                SHREE Multidisciplinary Healthcare Clinic
              </span>
              <h1 className="text-black text-[clamp(2.8rem,6.5vw,6rem)] font-bold leading-[0.86] tracking-tight">
                Clinical
                <br />
                Care
              </h1>
            </div>
          </div>
        </MaskedCard>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2 - SERVICES SHOWCASE (Masked Card Mosaic)      */}
      {/* ======================================================== */}
      <section
        id="services"
        ref={(el) => {
          section2Ref.current = el;
          s2Reveal.containerRef.current = el;
        }}
        className="min-h-screen md:h-screen w-full flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 md:grid-rows-[1.1fr_1.1fr_1fr] gap-1.5 md:gap-2">
          {/* Card 0 - Top Left ("Clinical Facilities") */}
          <MaskedCard
            cardRef={(el) => {
              s2CardRefs.current[0] = el;
            }}
            bgImage={SECTION2_IMAGE}
            position={s2Positions[0]}
            imageDimensions={s2ImageDimensions}
            focalX={isMobile ? 0.65 : 0.8}
            style={s2Reveal.getAnimStyle(0)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0 shadow-sm border border-neutral-200/50"
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
            <div className="relative z-10 h-full p-5 md:p-7 flex flex-col justify-between">
              <h2 className="text-black text-xl md:text-3xl font-bold tracking-tight">
                Clinical Facilities
              </h2>
              <p className="text-neutral-900 text-xs md:text-sm font-semibold leading-relaxed max-w-sm">
                Soundproof audiometry testing booths & specialized physical rehabilitation studios.
              </p>
            </div>
          </MaskedCard>

          {/* Card 1 - Top Right (Spans 2 rows on desktop) */}
          <MaskedCard
            cardRef={(el) => {
              s2CardRefs.current[1] = el;
            }}
            bgImage={SECTION2_IMAGE}
            position={s2Positions[1]}
            imageDimensions={s2ImageDimensions}
            focalX={isMobile ? 0.65 : 0.8}
            style={s2Reveal.getAnimStyle(1)}
            className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[220px] md:min-h-0 shadow-sm border border-neutral-200/50"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
            <div className="relative z-10 h-full p-5 md:p-8 flex flex-col justify-between">
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                DIAGNOSTIC & THERAPEUTIC CARE
              </span>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6">
                <div className="text-black text-xs md:text-sm font-semibold leading-relaxed max-w-xs">
                  Need personalized speech, hearing, or movement therapy?
                  <br />
                  Speak directly with our clinical coordinators.
                </div>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="px-6 py-3.5 bg-black rounded-full text-white text-sm md:text-base font-bold hover:bg-neutral-800 transition-transform active:scale-95 shadow-md w-fit shrink-0"
                >
                  Call Us
                </button>
              </div>
            </div>
          </MaskedCard>

          {/* Card 2 - Bottom Left ("Patient Journey") */}
          <MaskedCard
            cardRef={(el) => {
              s2CardRefs.current[2] = el;
            }}
            bgImage={SECTION2_IMAGE}
            position={s2Positions[2]}
            imageDimensions={s2ImageDimensions}
            focalX={isMobile ? 0.65 : 0.8}
            style={s2Reveal.getAnimStyle(2)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0 shadow-sm border border-neutral-200/50"
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
            <div className="relative z-10 h-full p-5 md:p-7 flex flex-col justify-between">
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                RECOVERY ROADMAP
              </span>
              <h2 className="text-black text-[clamp(2.4rem,4.5vw,4.2rem)] font-bold leading-[0.88] tracking-tight">
                Patient
                <br />
                journey
              </h2>
            </div>
          </MaskedCard>

          {/* Card 3 - Bottom Full Width (4 Services Grid) */}
          <MaskedCard
            cardRef={(el) => {
              s2CardRefs.current[3] = el;
            }}
            bgImage={SECTION2_IMAGE}
            position={s2Positions[3]}
            imageDimensions={s2ImageDimensions}
            focalX={isMobile ? 0.65 : 0.8}
            style={s2Reveal.getAnimStyle(3)}
            className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[190px] md:min-h-0 shadow-sm border border-neutral-200/50"
          >
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5 p-2 md:p-3 h-full">
              {activeServices.map((svc, idx) => (
                <div
                  key={svc.id}
                  onClick={() => handleSelectService(idx)}
                  className={`w-full h-full rounded-xl md:rounded-2xl p-3.5 md:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                    svc.active
                      ? 'bg-white/95 backdrop-blur-md shadow-md scale-[1.01] border border-black/10'
                      : 'bg-white/40 backdrop-blur-md hover:bg-white/60'
                  }`}
                >
                  <h3
                    className={`text-base md:text-xl font-bold leading-snug whitespace-pre-line ${
                      svc.active ? 'text-black' : 'text-neutral-800'
                    }`}
                  >
                    {svc.name}
                  </h3>

                  {svc.num && (
                    <div
                      className={`self-end w-7 h-7 md:w-10 md:h-10 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold mt-2 ${
                        svc.active
                          ? 'border-black text-black bg-black/5'
                          : 'border-neutral-400 text-neutral-600'
                      }`}
                    >
                      {svc.num}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </MaskedCard>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3 - REHABILITATION INTAKE (High-Contrast Grid)   */}
      {/* ======================================================== */}
      <section
        id="rehabilitation"
        ref={s3Reveal.containerRef}
        className="min-h-screen md:h-screen w-full flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          {/* LEFT COLUMN: 3 Cards */}
          <div className="flex flex-col gap-1.5 md:gap-2">
            {/* 1. Heading Card */}
            <div
              style={s3Reveal.getAnimStyle(0)}
              className="rounded-xl md:rounded-2xl bg-stone-50 p-5 md:p-7 flex flex-col justify-between flex-[1.1] min-h-[160px] md:min-h-0 border border-neutral-200"
            >
              <h2 className="text-[clamp(2.4rem,4.8vw,4.5rem)] font-bold leading-[0.92] text-black tracking-tight">
                Clinical
                <br />
                Rehabilitation
              </h2>
              <p className="text-xs md:text-sm font-semibold text-neutral-800">
                Restoring Hearing Clarity, Speech Fluency & Movement Independence
              </p>
            </div>

            {/* 2. Two Healthcare Image Cards Side by Side */}
            <div
              style={s3Reveal.getAnimStyle(1)}
              className="flex gap-1.5 md:gap-2 flex-1 min-h-[140px] md:min-h-0"
            >
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden relative group border border-neutral-200">
                <img
                  src={SECTION3_IMG1}
                  alt="Audiology sound booth diagnostic evaluation"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden relative group border border-neutral-200">
                <img
                  src={SECTION3_IMG2}
                  alt="Physical motor rehabilitation and balance training"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* 3. Consultation Card */}
            <div
              style={s3Reveal.getAnimStyle(2)}
              className="rounded-xl md:rounded-2xl bg-zinc-200 p-5 md:p-7 flex items-end justify-between flex-[0.9] min-h-[150px] md:min-h-0 border border-neutral-300"
            >
              <div>
                <p className="text-xs md:text-sm font-semibold text-neutral-600 mb-1.5">
                  Consultation
                </p>
                <h3 className="text-lg md:text-2xl font-bold text-black leading-tight">
                  Clinical
                  <br />
                  Intake
                  <br />
                  Services
                </h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-5 py-3 md:px-7 md:py-4 bg-white rounded-full text-black text-sm md:text-lg font-bold hover:scale-105 transition-transform shadow-md"
              >
                Book Online
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Single Tall Healthcare Image Card with Overlays */}
          <div
            style={s3Reveal.getAnimStyle(3)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[320px] md:min-h-0 group border border-neutral-200"
          >
            <img
              src={SECTION3_BG}
              alt="Caring specialist and patient in physical therapy session"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay Container */}
            <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 flex gap-1.5 md:gap-2">
              {/* Overlay Card 1 (White) */}
              <div
                onClick={() => setBookingModalOpen(true)}
                className="flex-1 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl p-3.5 md:p-5 flex flex-col justify-between min-h-[130px] md:min-h-[150px] cursor-pointer hover:bg-white transition-colors shadow-lg border border-neutral-200"
              >
                <h4 className="text-base md:text-xl font-bold text-black leading-snug">
                  The Process
                  <br />
                  of Clinical
                  <br />
                  Assessment
                </h4>
                <div className="self-end w-8 h-8 md:w-11 md:h-11 rounded-full border border-black flex items-center justify-center">
                  <svg
                    className="rotate-[-45deg]"
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M1 7h12m0 0L8 2m5 5L8 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Overlay Card 2 (Glass) */}
              <div
                onClick={() => setBookingModalOpen(true)}
                className="flex-1 bg-black/60 backdrop-blur-md rounded-xl md:rounded-2xl p-3.5 md:p-5 flex flex-col justify-between min-h-[130px] md:min-h-[150px] cursor-pointer hover:bg-black/75 transition-colors shadow-lg border border-white/20"
              >
                <h4 className="text-base md:text-xl font-bold text-white leading-snug">
                  Caring
                  <br />
                  for Lifelong
                  <br />
                  Milestones
                </h4>
                <div className="self-end w-8 h-8 md:w-11 md:h-11 rounded-full border border-white flex items-center justify-center text-white">
                  <svg
                    className="rotate-[-45deg] text-white"
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M1 7h12m0 0L8 2m5 5L8 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ======================================================== */}
      {/* SECTION 4 - CLEAR CLINICAL PROCEDURES BREAKDOWN           */}
      {/* ======================================================== */}
      <section id="procedures" className="py-20 md:py-28 px-3 md:px-5 max-w-[1440px] mx-auto">
        <div className="mb-12 md:mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            PRACTICE PROCEDURES · WHAT WE DO
          </span>
          <h2 className="text-4xl md:text-7xl font-bold text-black leading-tight tracking-tight">
            Specialized Procedures
          </h2>
          <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl">
            Clear, evidence-based treatments explained in plain language so you and your family know exactly what to expect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {initialServices.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-stone-50 rounded-xl md:rounded-2xl p-6 md:p-8 flex flex-col justify-between border border-neutral-200"
            >
              <div>
                <span className="text-xs font-mono font-bold text-neutral-400 block mb-3">
                  {item.num} / CLINICAL DISCIPLINE
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-black whitespace-pre-line mb-3">
                  {item.name}
                </h3>
                <p className="text-xs md:text-sm text-neutral-700 mb-4 leading-relaxed font-medium">
                  {item.plainEnglishSummary}
                </p>

                <div className="p-3 rounded-lg bg-neutral-100 text-xs text-neutral-700 mb-6">
                  <strong className="text-black block mb-0.5">Who this helps:</strong>
                  {item.whoItHelps}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-neutral-200">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Key Clinical Procedures:
                  </span>
                  {item.keyTreatments.map((proc, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs font-semibold text-black">
                      <span className="text-neutral-400 font-mono">0{pIdx + 1}.</span>
                      <span>{proc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="mt-8 w-full py-3.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Inquire For {item.name.replace('\n', ' ')} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5 - PATIENT JOURNEY EXPLAINED CLEARLY            */}
      {/* ======================================================== */}
      <section className="py-20 md:py-28 px-3 md:px-5 max-w-[1440px] mx-auto border-t border-neutral-100">
        <div className="mb-12 md:mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            STEP-BY-STEP CLINICAL CARE
          </span>
          <h2 className="text-4xl md:text-7xl font-bold text-black leading-tight tracking-tight">
            How Your Therapy Works
          </h2>
          <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl">
            We guide you through 5 clear stages from your very first conversation to long-term progress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {[
            {
              step: '01',
              title: 'Listen & Understand',
              desc: 'We start by sitting down and listening carefully to your symptoms, medical history, and daily challenges without rushing.'
            },
            {
              step: '02',
              title: 'Objective Testing',
              desc: 'We perform diagnostic tests—such as audiometry in a sound booth or functional physical mobility tests—to find the exact cause.'
            },
            {
              step: '03',
              title: 'Personalized Plan',
              desc: 'Your specialist creates a written therapy roadmap explaining what treatments will be done, how often, and expected timeframes.'
            },
            {
              step: '04',
              title: 'Targeted Therapy',
              desc: 'You attend structured, one-on-one therapy sessions with compassionate guidance and practical exercises to practice at home.'
            },
            {
              step: '05',
              title: 'Measure & Maintain',
              desc: 'We periodically re-test your hearing, speech, or mobility to measure real improvement and support your long-term independence.'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="bg-stone-50 rounded-xl md:rounded-2xl p-6 border border-neutral-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-neutral-400 block mb-3">
                  STAGE {item.step}
                </span>
                <h3 className="text-xl font-bold text-black mb-3">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6 - FREQUENTLY ASKED QUESTIONS                   */}
      {/* ======================================================== */}
      <section id="faqs" className="py-20 md:py-28 px-3 md:px-5 max-w-[1440px] mx-auto border-t border-neutral-100">
        <div className="mb-12 md:mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            PATIENT INFORMATION & FAQS
          </span>
          <h2 className="text-4xl md:text-7xl font-bold text-black leading-tight tracking-tight">
            Frequently Asked
          </h2>
          <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl">
            Clear, honest answers to the most common questions our clinic receives.
          </p>
        </div>

        <div className="space-y-2 md:space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-stone-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-neutral-200 cursor-pointer"
            >
              <summary className="flex items-center justify-between text-lg md:text-2xl font-bold text-black list-none">
                <span>{faq.q}</span>
                <span className="text-xl md:text-2xl font-normal transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-xs md:text-sm text-neutral-700 leading-relaxed max-w-3xl">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7 - CONTACT & CLINIC DESK                        */}
      {/* ======================================================== */}
      <section id="contact" className="py-20 md:py-28 px-3 md:px-5 max-w-[1440px] mx-auto border-t border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="bg-stone-50 p-6 md:p-12 rounded-xl md:rounded-2xl border border-neutral-200 flex flex-col justify-between min-h-[380px]">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                CLINIC LOCATION & INQUIRIES
              </span>
              <h2 className="text-3xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Come See Us.
              </h2>
              <div className="space-y-4 text-xs md:text-sm text-neutral-700">
                <div>
                  <strong className="block text-black">Address:</strong>
                  [CLINIC LOCATION TO BE CONFIRMED ON LAUNCH], India
                </div>
                <div>
                  <strong className="block text-black">Telephone Helpline:</strong>
                  +91 [CONTACT REQUIRED]
                </div>
                <div>
                  <strong className="block text-black">Consultation Windows:</strong>
                  Monday – Saturday: 09:00 AM – 07:00 PM · Sunday: By Prior Appointment
                </div>
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="mt-8 px-8 py-4 bg-black text-white rounded-full font-bold text-xs md:text-sm hover:bg-neutral-800 transition-colors w-fit"
            >
              Book In-Person Consultation →
            </button>
          </div>

          <div className="bg-zinc-200 p-6 md:p-12 rounded-xl md:rounded-2xl border border-neutral-300 min-h-[380px] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 block mb-2">
                SPEAK WITH A CARE COORDINATOR
              </span>
              <h3 className="text-2xl md:text-4xl font-bold text-black mb-4">
                Have a question before booking?
              </h3>
              <p className="text-xs md:text-sm text-neutral-700 leading-relaxed mb-6">
                Our care coordinators can answer questions regarding speech milestones, hearing aid repairs, or home physiotherapy options.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+91"
                className="px-6 py-3 bg-white text-black font-bold rounded-full text-xs hover:bg-neutral-100 transition-colors"
              >
                Call Clinic Desk
              </a>
              <a
                href="https://wa.me/?text=Hello%20SHREE%20Clinic,%20I%20would%20like%20to%20inquire%20about%20an%20appointment."
                className="px-6 py-3 bg-white text-black font-bold rounded-full text-xs hover:bg-neutral-100 transition-colors"
              >
                WhatsApp Inquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 08. FOOTER                                               */}
      {/* ======================================================== */}
      <footer className="bg-black text-white pt-20 pb-16 px-4 md:px-8 border-t border-neutral-900">
        <div className="max-w-[1440px] mx-auto flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-16 border-b border-neutral-800 gap-8">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-400 block mb-3">
                SHREE MULTIDISCIPLINARY HEALTHCARE
              </span>
              <h2 className="text-4xl md:text-8xl font-bold tracking-tight text-white leading-none">
                Quality Healthcare.
              </h2>
            </div>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-xs md:text-sm hover:bg-neutral-200 transition-colors self-start md:self-end"
            >
              Book Consultation →
            </button>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <p>
              © {new Date().getFullYear()} SHREE Multidisciplinary Healthcare Clinic. All rights reserved.
            </p>
            <p className="text-[11px] text-neutral-500 max-w-md text-center md:text-right">
              Medical Disclaimer: Information presented is for educational and scheduling purposes only. In-person clinical assessment by certified specialists is required for official diagnosis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
