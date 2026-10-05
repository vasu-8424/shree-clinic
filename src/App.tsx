import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Menu as MenuIcon,
  X as XIcon,
  Check,
  Calendar,
  ExternalLink,
  Headphones,
  MessageSquare,
  Activity,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

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
// CLINIC CONTACT CONSTANTS
// ==========================================
const CLINIC_PHONE = '+91 79954 78069';
const CLINIC_PHONE_CALL = 'tel:+917995478069';
const CLINIC_WHATSAPP_NUM = '917995478069';
const CLINIC_EMAIL = 'nimmasakethsaketh@gmail.com';
const WHATSAPP_URL =
  'https://wa.me/917995478069?text=Hello%20Shree%20Clinic,%20I%20would%20like%20to%20inquire%20about%20a%20consultation';

const CLINIC_FULL_ADDRESS =
  'SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203';
const CLINIC_PLUS_CODE = 'C5QM+PX Mokila, Telangana';
const CLINIC_MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=FREEDOM+HOSPITALS+SUBISHI+TOWN+CENTER+Mokila+Hyderabad+Telangana+501203';
const CLINIC_MAP_EMBED_URL =
  'https://maps.google.com/maps?q=FREEDOM%20HOSPITALS%2C%20SUBISHI%20TOWN%20CENTER%2C%20Shankarpalli%2C%20Mokila%2C%20Hyderabad%2C%20Telangana%20501203&t=&z=16&ie=UTF8&iwloc=&output=embed';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"/>
  </svg>
);

// ==========================================
// DATA CONSTANTS (SHREE MULTIDISCIPLINARY CLINIC)
// Clear, simple, patient-centered descriptions
// ==========================================
interface ClinicalDiscipline {
  id: string;
  title: string;
  tagline: string;
  serviceIdx: number;
  icon: 'audiology' | 'speech' | 'physio';
}

const clinicalDisciplines: ClinicalDiscipline[] = [
  {
    id: 'audiology',
    title: 'Audiology Services',
    tagline: 'Complete Hearing Assessment & Hearing Aid Care',
    serviceIdx: 0,
    icon: 'audiology'
  },
  {
    id: 'speech',
    title: 'Speech Therapy',
    tagline: 'Communication & Swallowing Solutions',
    serviceIdx: 1,
    icon: 'speech'
  },
  {
    id: 'physio',
    title: 'Physiotherapy',
    tagline: 'Personalized Pain Relief & Motor Rehab',
    serviceIdx: 2,
    icon: 'physio'
  }
];

export interface DetailedServiceItem {
  title: string;
  description: string;
}

export interface DetailedCategory {
  id: string;
  name: string;
  tagline: string;
  icon: 'audiology' | 'speech' | 'physio';
  services: DetailedServiceItem[];
}

const detailedClinicServices: DetailedCategory[] = [
  {
    id: 'audiology',
    name: 'Audiology Services',
    tagline: 'Complete hearing assessment and hearing aid care for children and adults.',
    icon: 'audiology',
    services: [
      {
        title: 'Pure Tone Audiometry (PTA)',
        description: 'Measures the softest sounds you can hear at different pitches to find the type and degree of hearing loss.'
      },
      {
        title: 'Speech Audiometry',
        description: 'Checks how clearly you understand speech, which guides hearing aid decisions.'
      },
      {
        title: 'Tympanometry (Impedance Audiometry)',
        description: 'A quick, painless test of eardrum and middle-ear function, useful for fluid and eardrum problems.'
      },
      {
        title: 'OAE (if available)',
        description: "An objective hearing screening test for infants and children who can't respond to regular tests."
      },
      {
        title: 'Hearing Aid Consultation, Trial and Fitting',
        description: 'Choosing, trying, programming and fine-tuning hearing aids, with follow-up visits and servicing.'
      },
      {
        title: 'Hearing Aid Walk-ins',
        description: 'Walk-in consultations, with a trial before you decide to buy.'
      }
    ]
  },
  {
    id: 'speech',
    name: 'Speech Therapy Services',
    tagline: 'Assessment and therapy for communication and swallowing difficulties, from toddlers to older adults.',
    icon: 'speech',
    services: [
      {
        title: 'Speech Delay and Language Development',
        description: 'Helps children who are late talkers or struggle to understand or express language.'
      },
      {
        title: 'Articulation and Speech Sound Therapy',
        description: 'Corrects unclear speech and mispronounced sounds.'
      },
      {
        title: 'Stuttering/Fluency Therapy',
        description: 'Techniques for smoother speech in children and adults.'
      },
      {
        title: 'Voice Therapy',
        description: 'For hoarseness, vocal strain and voice changes, including for teachers and other professional voice users.'
      },
      {
        title: 'Aphasia and Post-Stroke Rehabilitation',
        description: 'Rebuilding speech, language and communication after stroke or brain injury.'
      },
      {
        title: 'Cognitive-Communication Therapy',
        description: 'Support for memory, attention and communication problems after brain injury or in dementia.'
      },
      {
        title: 'Dysphagia (Swallowing) Management',
        description: 'Assessment and therapy for safe swallowing in children and adults.'
      },
      {
        title: 'VitalStim Therapy for Dysphagia',
        description: 'Gentle electrical stimulation of the swallowing muscles in the throat, combined with swallowing exercises, to help strengthen and retrain swallowing after stroke, brain injury or other neurological conditions.'
      },
      {
        title: 'Autism and Developmental Disorders',
        description: 'Social communication and language support.'
      }
    ]
  },
  {
    id: 'physio',
    name: 'Physiotherapy Services',
    tagline: 'Personalized rehabilitation to reduce pain, restore movement and improve independence.',
    icon: 'physio',
    services: [
      {
        title: 'Musculoskeletal and Orthopaedic',
        description: 'Back, neck and joint pain, arthritis, and fracture recovery.'
      },
      {
        title: 'Neuro Rehabilitation',
        description: "Stroke, paralysis, Parkinson's and nerve problems."
      },
      {
        title: 'Pediatric Physiotherapy',
        description: 'Developmental delay, cerebral palsy and motor difficulties.'
      },
      {
        title: 'Geriatric Physiotherapy',
        description: 'Mobility, balance and fall-prevention programs.'
      },
      {
        title: 'Sports Injury and Post-Surgery Rehabilitation',
        description: 'Safe recovery after injury or surgery.'
      },
      {
        title: 'Electrotherapy and Exercise Therapy',
        description: 'TENS, ultrasound, therapeutic exercise and similar modalities, as available.'
      },
      {
        title: 'Home Visits (optional)',
        description: 'Therapy at home, if you offer it.'
      }
    ]
  }
];

interface ServiceItem {
  id: string;
  name: string;
  active: boolean;
  plainEnglishSummary: string;
  whoItHelps: string;
  treatmentCount: number;
  icon: 'audiology' | 'speech' | 'physio';
}

const initialServices: ServiceItem[] = [
  {
    id: 'audiology',
    name: 'Audiology\nServices',
    active: true,
    plainEnglishSummary:
      'Complete hearing assessment and hearing aid care for children and adults.',
    whoItHelps: 'Infants, late-talking children, working adults, and seniors needing clear hearing.',
    treatmentCount: 6,
    icon: 'audiology'
  },
  {
    id: 'speech',
    name: 'Speech Therapy\nServices',
    active: false,
    plainEnglishSummary:
      'Assessment and therapy for communication and swallowing difficulties, from toddlers to older adults.',
    whoItHelps: 'Late talkers, stuttering/fluency challenges, voice fatigue, and stroke rehabilitation.',
    treatmentCount: 9,
    icon: 'speech'
  },
  {
    id: 'physio',
    name: 'Physiotherapy\nServices',
    active: false,
    plainEnglishSummary:
      'Personalized rehabilitation to reduce pain, restore movement and improve independence.',
    whoItHelps: 'Back & joint pain sufferers, post-surgery recovery, stroke patients, and motor delays.',
    treatmentCount: 7,
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
// FIXED NAVBAR & SLIDE-OVER MENU
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onCloseMenu();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 md:px-6 py-2 md:py-2.5 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        {/* Official Clinic Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="flex items-center select-none group py-0.5"
          title="Shree Clinic"
        >
          <img
            src="/shree-logo-transparent.png"
            alt="Shree Clinic Logo"
            className="h-10 sm:h-12 md:h-13 w-auto object-contain hover:opacity-90 transition-opacity drop-shadow-sm"
          />
        </a>

        {/* Desktop Direct Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xs font-bold text-neutral-600 hover:text-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Call, WhatsApp, Book, Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Call Action */}
          <a
            href={CLINIC_PHONE_CALL}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-black transition-all shadow-sm active:scale-95 group"
            title="Direct Helpline: +91 79954 78069"
          >
            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-2.5 h-2.5" />
            </span>
            <span className="hidden sm:inline font-semibold text-[11px] sm:text-xs">
              Call
            </span>
          </a>

          {/* Quick WhatsApp Action */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all shadow-sm active:scale-95 group"
            title="Chat on WhatsApp: +91 79954 78069"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <WhatsAppIcon className="w-3 h-3" />
            </span>
            <span className="hidden md:inline font-semibold text-[11px] sm:text-xs">
              WhatsApp
            </span>
          </a>

          {/* Book Appointment CTA */}
          <button
            onClick={onBookClick}
            className="px-3 sm:px-5 py-1.5 sm:py-2 bg-black rounded-full text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
          >
            Book Appointment
          </button>

          {/* Universal Menu Button (Works for both Desktop & Mobile) */}
          <button
            onClick={onMenuToggle}
            className="p-2 sm:px-3 sm:py-2 rounded-full border border-neutral-200 hover:border-black text-xs font-bold text-black flex items-center gap-1.5 hover:bg-black hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <MenuIcon className="w-4 h-4" />
            <span className="hidden xl:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* Universal Slide-over Drawer (Desktop & Mobile) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div onClick={onCloseMenu} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div
          className={`absolute top-0 right-0 h-full w-[90%] max-w-md bg-white shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between p-6 md:p-8 overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
            <img
              src="/shree-logo-transparent.png"
              alt="Shree Clinic Logo"
              className="h-10 w-auto object-contain"
            />
            <button
              onClick={onCloseMenu}
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-black font-bold transition-colors"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3.5 py-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              Site Navigation
            </span>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-2xl md:text-3xl font-bold text-black hover:text-neutral-500 transition-colors flex items-center justify-between group py-1"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>

          {/* Direct Contact Card */}
          <div className="pt-6 border-t border-neutral-200 space-y-3.5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                Direct Clinical Assistance
              </span>
              <p className="text-xs text-neutral-600">
                Mon–Sat: 09:00 AM – 07:00 PM · Sunday: By Appointment
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={CLINIC_PHONE_CALL}
                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold">Call Helpline</span>
                  <span className="text-sm font-bold text-black font-mono">{CLINIC_PHONE}</span>
                </div>
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold">WhatsApp Direct</span>
                  <span className="text-sm font-bold text-emerald-950 font-mono">{CLINIC_PHONE}</span>
                </div>
              </a>

              <a
                href={`mailto:${CLINIC_EMAIL}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-neutral-200/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold">Email Desk</span>
                  <span className="text-xs font-semibold text-black truncate">{CLINIC_EMAIL}</span>
                </div>
              </a>
            </div>

            <button
              onClick={() => {
                onCloseMenu();
                onBookClick();
              }}
              className="w-full py-3.5 bg-black rounded-full text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-md mt-2"
            >
              Book In-Person Consultation →
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

  const getFullEnquiryUrl = () => {
    const message = [
      '*CLINICAL CONSULTATION ENQUIRY — SHREE CLINIC*',
      '----------------------------------------',
      `• *Patient / Guardian Name:* ${name.trim() || 'Not specified'}`,
      `• *Contact Phone Number:* ${phone.trim() || 'Not specified'}`,
      `• *Patient Age Group:* ${careTarget}`,
      `• *Requested Clinical Service:* ${selectedService}`,
      `• *Preferred Appointment Date:* ${date || 'Earliest available'}`,
      `• *Preferred Time Window:* ${time}`,
      `• *Symptoms / Clinical Concern:* ${concern.trim() || 'None provided'}`,
      '----------------------------------------',
      'Sent directly from Shree Clinic Website'
    ].join('\n');

    return `https://wa.me/917995478069?text=${encodeURIComponent(message)}`;
  };

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
      const url = getFullEnquiryUrl();
      window.open(url, '_blank');
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
                <p className="text-xs text-neutral-600 mb-4">
                  Confirm your procedure or choose your primary area of care:
                </p>

                {selectedService &&
                  ![
                    'Audiology & Hearing Care',
                    'Speech & Language Therapy',
                    'Physiotherapy & Mobility',
                    'Not Sure (Need Assessment)'
                  ].includes(selectedService) && (
                    <div className="mb-4 p-3.5 rounded-xl bg-black text-white flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
                          Selected Procedure
                        </span>
                        <span className="text-sm font-bold text-white block mt-0.5">
                          {selectedService}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Confirmed
                      </span>
                    </div>
                  )}

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
                className={`px-7 py-3.5 rounded-full text-white text-xs md:text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                  step < 7
                    ? 'bg-black hover:bg-neutral-800'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {step < 7 ? (
                  'Next Step →'
                ) : (
                  <>
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>SEND DETAILS TO CLINIC ({CLINIC_PHONE}) →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-lg">
              ✓
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
              ENQUIRY SENT TO CLINIC
            </h3>
            <p className="text-xs md:text-sm text-neutral-700 max-w-md mx-auto mb-6 leading-relaxed">
              Your details for <strong className="text-black">{name || 'Patient'}</strong> have been redirected to our displayed business number <strong className="text-black font-mono">{CLINIC_PHONE}</strong>. Our clinical team will confirm your consultation shortly.
            </p>

            <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-neutral-200 text-left text-xs space-y-2 mb-6 text-black max-w-md mx-auto">
              <div className="flex justify-between border-b border-neutral-200/70 pb-1.5">
                <span className="text-neutral-500 font-semibold">Patient Name:</span>
                <span className="font-bold text-black">{name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/70 pb-1.5">
                <span className="text-neutral-500 font-semibold">Contact Phone:</span>
                <span className="font-bold text-black font-mono">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/70 pb-1.5">
                <span className="text-neutral-500 font-semibold">Patient Category:</span>
                <span className="font-bold text-black">{careTarget}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/70 pb-1.5">
                <span className="text-neutral-500 font-semibold">Requested Service:</span>
                <span className="font-bold text-black">{selectedService}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/70 pb-1.5">
                <span className="text-neutral-500 font-semibold">Preferred Schedule:</span>
                <span className="font-bold text-black">{date || 'Earliest Available'} ({time})</span>
              </div>
              {concern.trim() && (
                <div className="pt-1">
                  <span className="text-neutral-500 font-semibold block mb-0.5">Clinical Concern / Symptoms:</span>
                  <p className="text-neutral-800 italic bg-white p-2.5 rounded-lg border border-neutral-200">{concern}</p>
                </div>
              )}
            </div>

            {/* Direct Business Actions: "Done" button removed per owner request */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getFullEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-full text-xs md:text-sm font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Open WhatsApp Chat ({CLINIC_PHONE})</span>
              </a>

              <a
                href={CLINIC_PHONE_CALL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-full text-xs md:text-sm font-bold hover:bg-neutral-800 transition-all shadow-md active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Business Number</span>
              </a>
            </div>
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
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [bookingService, setBookingService] = useState<string>('Audiology Services');

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
    const catId = detailedClinicServices[index]?.id;
    if (catId) {
      setSelectedCategoryTab(catId);
    }
  };

  const handleInquireTreatment = (treatmentName: string) => {
    setBookingService(treatmentName);
    setBookingModalOpen(true);
  };

  const activeServiceData = activeServices.find((s) => s.active) || activeServices[0];

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      {/* 01. SPLASH SCREEN (0-100 Counter) */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* 02. FIXED NAVBAR */}
      <Navbar
        onBookClick={() => handleInquireTreatment(activeServiceData.name.replace('\n', ' '))}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMenu={() => setMobileMenuOpen(false)}
      />

      {/* 03. APPOINTMENT INTAKE MODAL */}
      <AppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedService={bookingService}
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
        className="min-h-screen md:h-screen w-full flex flex-col pt-20 md:pt-20 px-3 md:px-5 pb-2 md:pb-3 gap-2 md:gap-2.5"
      >
        {/* 3 Clinical Feature Disciplines - Premium 3-Column Glass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2.5 shrink-0 z-10">
          {clinicalDisciplines.map((item, i) => (
            <MaskedCard
              key={item.id}
              cardRef={(el) => {
                s1CardRefs.current[i] = el;
              }}
              bgImage={HERO_IMAGE}
              position={s1Positions[i]}
              imageDimensions={s1ImageDimensions}
              focalX={isMobile ? 0.7 : 0.8}
              style={s1Reveal.getAnimStyle(i)}
              onClick={() => {
                handleSelectService(item.serviceIdx);
                const el = document.getElementById(`category-${item.id}`) || document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200/70 hover:border-black/50 transition-all duration-300 cursor-pointer group hover:shadow-md"
            >
              <div className="absolute inset-0 bg-white/80 group-hover:bg-white/95 backdrop-blur-[6px] transition-colors duration-300" />
              <div className="relative z-10 h-full px-3.5 md:px-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-300">
                    {item.icon === 'audiology' && <Headphones className="w-4 h-4" />}
                    {item.icon === 'speech' && <MessageSquare className="w-4 h-4" />}
                    {item.icon === 'physio' && <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-black text-xs md:text-sm font-bold tracking-tight truncate leading-tight group-hover:text-black">
                      {item.title}
                    </span>
                    <span className="text-[10px] md:text-[11px] font-medium text-neutral-600 truncate leading-tight mt-0.5">
                      {item.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="hidden xl:inline text-[9px] font-mono uppercase tracking-wider text-neutral-500 font-semibold bg-black/5 px-2 py-0.5 rounded-md">
                    Explore
                  </span>
                  <div className="w-6 h-6 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </MaskedCard>
          ))}
        </div>

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
          className="w-full flex-1 min-h-[380px] md:min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200/50"
        >
          {/* Readability gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-white/40 pointer-events-none" />

          {/* Structured flex content container that prevents any overlapping */}
          <div className="relative z-10 h-full p-5 md:p-8 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <p className="text-black text-xs md:text-sm font-semibold leading-relaxed max-w-[300px] md:max-w-md bg-white/85 backdrop-blur-md p-3 rounded-xl border border-neutral-200/60 shadow-sm">
                Dedicated clinical care for children, adults & seniors
                combining audiology, speech & physical rehabilitation.
              </p>
              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="inline-flex items-center gap-2 text-black text-xs font-bold px-4 py-2 rounded-full bg-white/95 hover:bg-black hover:text-white backdrop-blur-md border border-neutral-300 shadow-sm transition-all duration-200 w-fit shrink-0 cursor-pointer active:scale-95 group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Direct Consultation Intake</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Bottom row */}
            <div className="pt-4 md:pt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                {/* Official Clinic Logo - Big, Clear & High Visibility */}
                <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-200/90 shadow-xl inline-flex items-center justify-center max-w-[280px] sm:max-w-[360px] md:max-w-[420px] transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src="/shree-logo.png"
                    alt="Shree Clinic Logo"
                    className="w-full h-auto max-h-24 sm:max-h-32 md:max-h-40 object-contain select-none"
                  />
                </div>

                {/* Direct Quick Contact Action Pill - Clean Icons */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-200/80 shadow-sm w-fit">
                  <a
                    href={CLINIC_PHONE_CALL}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Direct Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Us</span>
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Direct WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={CLINIC_PHONE_CALL}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-white text-black border border-neutral-300 rounded-full text-xs md:text-sm font-bold hover:bg-neutral-100 transition-all active:scale-95 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Us</span>
                  </a>
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="px-5 py-3 bg-black rounded-full text-white text-xs md:text-sm font-bold hover:bg-neutral-800 transition-all active:scale-95 shadow-md"
                  >
                    Book Online
                  </button>
                </div>
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
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-2.5 p-2 md:p-3 h-full">
              {activeServices.map((svc, idx) => (
                <div
                  key={svc.id}
                  onClick={() => {
                    handleSelectService(idx);
                    const el = document.getElementById(`category-${svc.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full h-full rounded-xl md:rounded-2xl p-3.5 md:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 group ${
                    svc.active
                      ? 'bg-white/95 backdrop-blur-md shadow-md scale-[1.01] border border-black/20'
                      : 'bg-white/50 backdrop-blur-md hover:bg-white/75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-black">
                      {svc.icon === 'audiology' && <Headphones className="w-4 h-4" />}
                      {svc.icon === 'speech' && <MessageSquare className="w-4 h-4" />}
                      {svc.icon === 'physio' && <Activity className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500 bg-black/5 px-2.5 py-0.5 rounded-full">
                      {svc.treatmentCount} Treatments
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h3
                      className={`text-base md:text-xl font-bold leading-snug whitespace-pre-line ${
                        svc.active ? 'text-black' : 'text-neutral-800'
                      }`}
                    >
                      {svc.name}
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {svc.plainEnglishSummary}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-200/50">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 group-hover:text-black uppercase tracking-wider">
                      Explore All Procedures
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
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
        <div className="mb-10 md:mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            CLINICAL DIRECTORY · ALL 22 EVIDENCE-BASED SERVICES
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-7xl font-bold text-black leading-tight tracking-tight">
                Our Clinical Services
              </h2>
              <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl font-medium">
                Comprehensive assessment and therapy across Audiology, Speech Therapy, and Physiotherapy. Every service is detailed below so you and your family can make informed healthcare choices.
              </p>
            </div>

            {/* Direct Quick Assistance Badge */}
            <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-2xl border border-neutral-200 shrink-0">
              <a
                href={CLINIC_PHONE_CALL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold transition-all shadow-sm"
              >
                <Phone className="w-3 h-3" />
                <span>Call Helpline</span>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm"
              >
                <WhatsAppIcon className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-neutral-200/80">
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategoryTab === 'all'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-neutral-700'
              }`}
            >
              All Services (22)
            </button>
            {detailedClinicServices.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryTab(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategoryTab === cat.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-neutral-700'
                }`}
              >
                {cat.icon === 'audiology' && <Headphones className="w-3.5 h-3.5" />}
                {cat.icon === 'speech' && <MessageSquare className="w-3.5 h-3.5" />}
                {cat.icon === 'physio' && <Activity className="w-3.5 h-3.5" />}
                <span>
                  {cat.name} ({cat.services.length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories and Treatment Cards */}
        <div className="space-y-16">
          {detailedClinicServices
            .filter((cat) => selectedCategoryTab === 'all' || selectedCategoryTab === cat.id)
            .map((category) => (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-28"
              >
                {/* Category Header Banner */}
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                      {category.icon === 'audiology' && <Headphones className="w-6 h-6" />}
                      {category.icon === 'speech' && <MessageSquare className="w-6 h-6" />}
                      {category.icon === 'physio' && <Activity className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-2xl md:text-3xl font-bold text-black">
                          {category.name}
                        </h3>
                        <span className="text-[11px] font-mono font-semibold bg-stone-100 text-neutral-600 px-2.5 py-0.5 rounded-full border border-neutral-200">
                          {category.services.length} Specialized Services
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 mt-1 font-medium">
                        {category.tagline}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInquireTreatment(category.name)}
                    className="self-start md:self-auto px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm shrink-0"
                  >
                    Consult {category.name.replace(' Services', '')} Specialist →
                  </button>
                </div>

                {/* Grid of All Services in this Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {category.services.map((service) => (
                    <div
                      key={service.title}
                      className="bg-stone-50 hover:bg-white rounded-xl md:rounded-2xl p-6 md:p-7 flex flex-col justify-between border border-neutral-200/80 hover:border-black/40 transition-all duration-300 shadow-sm hover:shadow-md group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 bg-black/5 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {category.name.replace(' Services', '')}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-widest">
                            Evidence-Based
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-black mb-3 leading-snug group-hover:text-black transition-colors">
                          {service.title}
                        </h4>

                        <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-normal">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-5 mt-6 border-t border-neutral-200/70 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInquireTreatment(service.title)}
                          className="flex-1 py-2.5 px-4 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>Book Consultation</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <a
                          href={`https://wa.me/917995478069?text=${encodeURIComponent(
                            `Hello Shree Clinic, I would like to inquire about ${service.title}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all active:scale-95 shrink-0"
                          title={`WhatsApp inquiry for ${service.title}`}
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
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
      {/* SECTION 7 - CONTACT, CLINIC LOCATION & MAPS               */}
      {/* ======================================================== */}
      <section id="contact" className="py-20 md:py-28 px-3 md:px-5 max-w-[1440px] mx-auto border-t border-neutral-100">
        <div className="mb-10 md:mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            CLINIC LOCATION & ACCESS · FREEDOM HOSPITALS
          </span>
          <h2 className="text-4xl md:text-7xl font-bold text-black leading-tight tracking-tight">
            Come See Us.
          </h2>
          <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl font-medium">
            Located at Freedom Hospitals in Subishi Town Center, Mokila. Convenient clinical access with 24-hour facility support and dedicated therapy studios.
          </p>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch mb-8">
          {/* Card 1: Official Address & Clinic Info */}
          <div className="bg-stone-50 p-6 md:p-10 rounded-2xl md:rounded-3xl border border-neutral-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Open 24 Hours Facility
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                Freedom Hospitals Facility
              </h3>

              <div className="space-y-3.5 text-xs md:text-sm text-neutral-700">
                <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-black font-bold text-sm mb-1">
                        Exact Hospital Address:
                      </strong>
                      <p className="text-neutral-800 font-medium leading-relaxed">
                        SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-stone-100 text-neutral-700 px-2.5 py-1 rounded-md border border-neutral-200 font-semibold">
                          Plus Code: {CLINIC_PLUS_CODE}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
                    <strong className="block text-black font-bold text-xs uppercase tracking-wider mb-1">
                      Direct Helpline:
                    </strong>
                    <a href={CLINIC_PHONE_CALL} className="text-sm font-bold text-black font-mono hover:underline block">
                      {CLINIC_PHONE}
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
                    <strong className="block text-black font-bold text-xs uppercase tracking-wider mb-1">
                      Direct WhatsApp:
                    </strong>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-emerald-700 font-mono hover:underline block"
                    >
                      {CLINIC_PHONE}
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-black font-bold text-xs uppercase tracking-wider mb-0.5">
                        Operating Hours:
                      </strong>
                      <p className="text-neutral-700 text-xs leading-relaxed">
                        <strong className="text-black">Hospital Facility:</strong> Open 24 Hours
                        <br />
                        <strong className="text-black">Consultation Windows:</strong> Monday – Saturday: 09:00 AM – 07:00 PM · Sunday: By Prior Appointment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="px-6 py-3.5 bg-black text-white rounded-full font-bold text-xs hover:bg-neutral-800 transition-all shadow-md active:scale-95"
              >
                Book In-Person Consultation →
              </button>
              <a
                href={CLINIC_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 bg-white text-black border border-neutral-300 rounded-full font-bold text-xs hover:bg-neutral-100 transition-all shadow-sm active:scale-95"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Coordinator Support & Fast Navigation */}
          <div className="bg-zinc-100 p-6 md:p-10 rounded-2xl md:rounded-3xl border border-neutral-200 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 block mb-2">
                SPEAK WITH A CARE COORDINATOR
              </span>
              <h3 className="text-2xl md:text-4xl font-bold text-black mb-4">
                Have a question before booking?
              </h3>
              <p className="text-xs md:text-sm text-neutral-700 leading-relaxed mb-6 font-medium">
                Our care coordinators at Freedom Hospitals, Subishi Town Center are available directly on telephone or WhatsApp to answer questions regarding speech milestones, audiometry diagnostics, hearing aid trials, or home physiotherapy visits.
              </p>

              <div className="space-y-2.5">
                <a
                  href={CLINIC_PHONE_CALL}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
                        Telephone Helpline
                      </span>
                      <span className="text-sm font-bold text-black font-mono">
                        {CLINIC_PHONE}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                        WhatsApp Instant Inquiry
                      </span>
                      <span className="text-sm font-bold text-emerald-950 font-mono">
                        {CLINIC_PHONE}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href={`mailto:${CLINIC_EMAIL}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
                        Email Desk
                      </span>
                      <span className="text-xs font-semibold text-black">
                        {CLINIC_EMAIL}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-200/80">
              <span className="text-[11px] text-neutral-600 font-medium block">
                📍 Subishi Town Center, Shankarpalli Road, Mokila, Hyderabad
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Google Map Frame with Exact Location */}
        <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-lg">
          <div className="p-4 md:p-5 bg-neutral-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm md:text-base font-bold text-white block">
                  Freedom Hospitals, Subishi Town Center
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  Mokila, Shankarpalli, Hyderabad · Plus Code: {CLINIC_PLUS_CODE}
                </span>
              </div>
            </div>

            <a
              href={CLINIC_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shrink-0 self-start sm:self-auto shadow-sm active:scale-95"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full h-[380px] sm:h-[440px] md:h-[500px] bg-stone-100 relative">
            <iframe
              title="Freedom Hospitals Subishi Town Center Mokila Map"
              src={CLINIC_MAP_EMBED_URL}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
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
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-none mb-4">
                Quality Healthcare.
              </h2>
              <div className="flex items-start gap-2 text-xs text-neutral-300 max-w-xl mb-6">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="leading-relaxed">
                    SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203
                  </p>
                  <a
                    href={CLINIC_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 mt-1.5 font-semibold underline"
                  >
                    <span>View Location on Google Maps ({CLINIC_PLUS_CODE})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300">
                <a href={CLINIC_PHONE_CALL} className="flex items-center gap-1.5 hover:text-white">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{CLINIC_PHONE}</span>
                </a>
                <span>·</span>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp Inquiries</span>
                </a>
                <span>·</span>
                <a
                  href={`mailto:${CLINIC_EMAIL}`}
                  className="flex items-center gap-1.5 hover:text-white font-sans"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{CLINIC_EMAIL}</span>
                </a>
              </div>
            </div>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-xs md:text-sm hover:bg-neutral-200 transition-colors self-start md:self-end shadow-lg"
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

      {/* ======================================================== */}
      {/* 09. FLOATING ACTION DOCK (Call & WhatsApp Quick Access)   */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-lg rounded-full border border-neutral-200 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <a
          href={CLINIC_PHONE_CALL}
          aria-label={`Call ${CLINIC_PHONE}`}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform"
          title={`Call Clinic: ${CLINIC_PHONE}`}
        >
          <Phone className="w-4 h-4" />
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${CLINIC_PHONE}`}
          className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform"
          title={`WhatsApp: ${CLINIC_PHONE}`}
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
        <button
          onClick={() => setBookingModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
        >
          <span>Book Visit</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
