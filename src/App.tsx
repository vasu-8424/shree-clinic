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
  Sparkles,
  ShieldCheck
} from 'lucide-react';

// ==========================================
// REAL HEALTHCARE PHOTOGRAPHY (from internet)
// Tailored to Audiology, Speech Therapy, and Physiotherapy
// ==========================================
const HERO_IMAGE = '/images/hero-clinic-room.jpg';

const SECTION2_IMAGE = '/images/clinic-facility-reception.jpg';

const SECTION3_IMG1 = '/images/child_development.jpg';

const SECTION3_IMG2 = '/images/manual-therapy-mobilization.jpg';

const SECTION3_BG = '/images/hearing-aid-fitting.jpg';

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
// AUTHENTIC CLINICAL MEDICAL ICONS
// Real anatomical & physiological representations for each discipline
// ==========================================
const AudiologyMedicalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Anatomical Ear Outline */}
    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
    {/* Inner Ear Acoustic Canal */}
    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4" />
    {/* Sound Wave Resonance Arc */}
    <path d="M19.5 5.5a9 9 0 0 1 0 6" strokeWidth="1.8" opacity="0.9" />
  </svg>
);

const SpeechMedicalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Human Speech Profile Silhouette */}
    <path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20" />
    {/* Vocal Acoustic Wave Frequencies */}
    <path d="M19.8 17.8a7.5 7.5 0 0 0 .003-10.603" />
    <path d="M17 15a3.5 3.5 0 0 0-.025-4.975" />
  </svg>
);

const PhysiotherapyMedicalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Postural Head Alignment */}
    <circle cx="12" cy="4" r="1.8" fill="currentColor" />
    {/* Spine / Vertebral Mobility Column */}
    <path d="M12 6.5v10" strokeWidth="2.6" />
    {/* Kinetic Musculoskeletal Arms */}
    <path d="m6 10 6-2 6 2" />
    {/* Joint Mobility & Lower Extremity Restoration */}
    <path d="m8.5 21 3.5-4.5 3.5 4.5" />
    {/* Range-of-Motion Kinetic Arc */}
    <path d="M4 14.5a8 8 0 0 1 16 0" strokeDasharray="2.5 2.5" strokeWidth="1.6" />
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

export interface ClinicalSubGroup {
  number: number;
  title: string;
  image: string;
  imageAlt: string;
  imageBadge: string;
  items: string[];
}

export interface DetailedServiceItem {
  title: string;
  description?: string;
}

export interface DetailedCategory {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  subtitle: string;
  icon: 'audiology' | 'speech' | 'physio';
  image: string;
  imageAlt: string;
  imageBadge: string;
  groups: ClinicalSubGroup[];
  services: DetailedServiceItem[];
}

const detailedClinicServices: DetailedCategory[] = [
  {
    id: 'audiology',
    name: 'Our Audiology & Hearing Care Services:',
    shortName: 'Audiology',
    tagline: 'Comprehensive hearing diagnostic assessments, objective infant screenings, and certified multi-brand digital hearing aid trials.',
    subtitle: 'Assessment, Diagnosis and Management for :',
    icon: 'audiology',
    image: '/images/audiology-diagnostic-booth.jpg',
    imageAlt: 'Pure tone audiometry hearing assessment in sound treated booth',
    imageBadge: 'Sound-Treated Audiology Suite',
    groups: [
      {
        number: 1,
        title: 'Diagnostic Hearing Tests',
        image: '/images/audiology-diagnostic-booth.jpg',
        imageAlt: 'Pure Tone Audiometry hearing test inside soundproof acoustic room',
        imageBadge: 'Sound-Treated Audiology Suite',
        items: [
          'Pure Tone Audiometry (PTA – Air & Bone)',
          'Speech Audiometry (Speech Reception & Discrimination)',
          'Special Audiological Tests & High-Frequency PTA',
          'Tone Decay & SISI Diagnostics'
        ]
      },
      {
        number: 2,
        title: 'Middle Ear & Impedance Tests',
        image: '/images/audiology-middle-ear-exam.jpg',
        imageAlt: 'Middle ear tympanometry and acoustic reflex examination',
        imageBadge: 'Tympanometry & Middle Ear Diagnostic',
        items: [
          'Tympanometry (Middle Ear Pressure & Eardrum Mobility)',
          'Acoustic Reflex Testing & Reflex Decay',
          'Eustachian Tube Function Assessment'
        ]
      },
      {
        number: 3,
        title: 'Pediatric Hearing Screenings',
        image: '/images/audiology-pediatric-screening.jpg',
        imageAlt: 'Pediatric hearing screening and newborn audiological evaluation',
        imageBadge: 'Pediatric Hearing Screening',
        items: [
          'Otoacoustic Emissions (OAE) Newborn Screening',
          'Pediatric Visual Reinforcement & Play Audiometry',
          'Early Identification of Childhood Hearing Loss'
        ]
      },
      {
        number: 4,
        title: 'Digital Hearing Aid Solutions',
        image: '/images/audiology-digital-hearing-aids.jpg',
        imageAlt: 'Multi-brand digital hearing aid trial and smartphone programming',
        imageBadge: 'Digital Hearing Aid Solutions',
        items: [
          'Multi-Brand Digital Hearing Aid Consultation',
          'Live Speech Hearing Aid Trial & Demonstration',
          'Computerized Programming, Fine-Tuning & Custom Earmolds',
          'Hearing Aid Servicing, Cleaning & Walk-in Care'
        ]
      },
      {
        number: 5,
        title: 'Auditory & Tinnitus Care',
        image: '/images/audiology-tinnitus-consultation.jpg',
        imageAlt: 'Clinical tinnitus assessment and specialist counseling',
        imageBadge: 'Tinnitus & Ear Care Consultation',
        items: [
          'Tinnitus (Ear Ringing) Assessment & Relief Counseling',
          'Age-Related Hearing Loss (Presbycusis) Guidance',
          'Noise Protection & Custom Ear Molds'
        ]
      }
    ],
    services: [
      { title: 'Pure Tone Audiometry (PTA)' },
      { title: 'Speech Audiometry' },
      { title: 'Tympanometry (Impedance Audiometry)' },
      { title: 'OAE Newborn Screening' },
      { title: 'Hearing Aid Consultation, Trial and Fitting' },
      { title: 'Tinnitus & Ear Protection Management' }
    ]
  },
  {
    id: 'speech',
    name: 'Our Speech Language Pathology Services:',
    shortName: 'Speech Therapy',
    tagline: 'Evidence-based clinical therapy for speech delays, voice disorders, stuttering, and swallowing rehabilitation across all age groups.',
    subtitle: 'Assessment, Diagnosis and Therapy for :',
    icon: 'speech',
    image: '/images/speech-voice-therapy.jpg',
    imageAlt: 'Specialized speech language pathology consultation room',
    imageBadge: 'Specialized Speech & Swallowing Clinic',
    groups: [
      {
        number: 1,
        title: 'Voice Disorders',
        image: '/images/speech-voice-therapy.jpg',
        imageAlt: 'Clinical voice therapy and acoustic assessment consultation',
        imageBadge: 'Voice Disorders & Acoustic Therapy',
        items: [
          'Stroboscope Guidance & Voice Assessment',
          'Puberphonia (High-Pitched Voice in Males)',
          'Spastic Dysphonia & Vocal Tremors',
          'Vocal Fold Paralysis & Paresis',
          'Vocal Cord Nodules',
          'Vocal Polyps & Chronic Hoarseness'
        ]
      },
      {
        number: 2,
        title: 'Articulation Disorders',
        image: '/images/speech-articulation.jpg',
        imageAlt: 'Articulation and pronunciation speech clarity therapy session',
        imageBadge: 'Articulation & Speech Clarity Clinic',
        items: [
          'Pronunciation Errors & Sound Substitutions',
          'Lisping & Unclear Speech Production',
          'Childhood Apraxia of Speech (CAS)'
        ]
      },
      {
        number: 3,
        title: 'Fluency Disorders',
        image: '/images/speech-fluency-stuttering.jpg',
        imageAlt: 'Fluency and stuttering speech therapy session',
        imageBadge: 'Fluency & Stuttering Therapy',
        items: [
          'Stammering / Stuttering Therapy',
          'Cluttering (Rapid or Irregular Speech)'
        ]
      },
      {
        number: 4,
        title: 'Language Disorders',
        image: '/images/speech-child-delays.jpg',
        imageAlt: 'Pediatric speech and language developmental therapy session',
        imageBadge: 'Pediatric Language & Communication',
        items: [
          'Specific Language Impairment (SLI)',
          'Delayed Speech and Language in Children',
          'Language-Based Learning Disability',
          'Autism Spectrum Communication Support'
        ]
      },
      {
        number: 5,
        title: 'Neurogenic Disorders',
        image: '/images/speech-neurogenic.jpg',
        imageAlt: 'Neurogenic speech and stroke communication recovery therapy',
        imageBadge: 'Neurogenic & Stroke Recovery',
        items: [
          'Slurred Speech Following Stroke (Dysarthria)',
          'Aphasia Post-Stroke Rehabilitation',
          'Cognitive-Communication Therapy'
        ]
      },
      {
        number: 6,
        title: 'VitalStim® Swallowing Therapy (Dysphagia)',
        image: '/images/vitalstim-swallowing-therapy.jpg',
        imageAlt: 'VitalStim therapy non-invasive neuromuscular electrical stimulation for swallowing difficulties',
        imageBadge: 'VitalStim® Therapy System',
        items: [
          'Non-Invasive Neuromuscular Electrical Stimulation (NMES)',
          'VitalStim® Therapy for Swallowing Muscles',
          'Clinical Dysphagia Evaluation & Safe Swallow Protocols',
          'Biofeedback-Guided Swallowing Muscle Retraining',
          'Stroke, Neurological & Post-Intubation Dysphagia Recovery'
        ]
      }
    ],
    services: [
      { title: 'Voice Disorders (Puberphonia, Nodules, Polyps)' },
      { title: 'Articulation & Pronunciation Therapy' },
      { title: 'Stuttering & Fluency Therapy' },
      { title: 'Delayed Speech & Language Development' },
      { title: 'Aphasia & Stroke Neurogenic Recovery' },
      { title: 'VitalStim® Therapy for Swallowing Difficulties (Dysphagia)' }
    ]
  },
  {
    id: 'physio',
    name: 'Our Physiotherapy & Rehabilitation Services:',
    shortName: 'Physiotherapy',
    tagline: 'Personalized physical rehabilitation, advanced electrotherapy, manual joint mobilization, and stroke motor recovery.',
    subtitle: 'Assessment, Diagnosis and Rehabilitation for :',
    icon: 'physio',
    image: '/images/physio-ortho-back-pain.jpg',
    imageAlt: 'Orthopaedic spine, back and joint pain physical therapy',
    imageBadge: 'Physical Rehabilitation Facility',
    groups: [
      {
        number: 1,
        title: 'Musculoskeletal & Orthopaedic Conditions',
        image: '/images/physio-ortho-back-pain.jpg',
        imageAlt: 'Orthopaedic spine, back and joint pain physical therapy',
        imageBadge: 'Spine & Orthopaedic Pain Clinic',
        items: [
          'Acute & Chronic Low Back Pain, Sciatica & Disc Bulge',
          'Cervical Spondylosis, Neck Pain & Postural Strain',
          'Frozen Shoulder & Rotator Cuff Tendonitis',
          'Knee Osteoarthritis, Joint Pain & Post-Fracture Stiffness'
        ]
      },
      {
        number: 2,
        title: 'Neurological Rehabilitation',
        image: '/images/physio-neuro-rehab.jpg',
        imageAlt: 'Stroke motor retraining and neurological physical therapy gym',
        imageBadge: 'Neurological Rehabilitation Studio',
        items: [
          'Stroke Recovery & Hemiplegia Motor Retraining',
          "Parkinson's Movement Therapy & Balance Retraining",
          "Bell's Palsy Facial Neuromuscular Stimulation",
          'Spinal Cord & Peripheral Nerve Injury Rehabilitation'
        ]
      },
      {
        number: 3,
        title: 'Pediatric Physiotherapy',
        image: '/images/physio-pediatric-motor.jpg',
        imageAlt: 'Pediatric developmental motor physiotherapy session',
        imageBadge: 'Pediatric Motor Development',
        items: [
          'Developmental Delay & Motor Milestones',
          'Cerebral Palsy (CP) Rehabilitation & Spasticity Control',
          'Congenital Musculoskeletal & Gait Abnormalities'
        ]
      },
      {
        number: 4,
        title: 'Geriatric Mobility & Fall Prevention',
        image: '/images/physio-geriatric-mobility.jpg',
        imageAlt: 'Geriatric balance training and physical therapy rehabilitation',
        imageBadge: 'Geriatric Balance & Mobility',
        items: [
          'Balance, Coordination & Safe Walking Training',
          'Age-Related Joint Mobility & Functional Independence'
        ]
      },
      {
        number: 5,
        title: 'Electrotherapy & Exercise Modalities',
        image: '/images/physio-exercise-gym.jpg',
        imageAlt: 'Targeted therapeutic exercise gym and electrotherapy modalities',
        imageBadge: 'Therapeutic Exercise & Gym Studio',
        items: [
          'TENS, Ultrasound Therapy & Muscle Stimulation',
          'Targeted Therapeutic Exercises & Core Strengthening',
          'Post-Surgery Rehabilitation & Home Care Guidance'
        ]
      }
    ],
    services: [
      { title: 'Orthopaedic & Back Pain Rehabilitation' },
      { title: 'Stroke & Neurological Motor Therapy' },
      { title: 'Pediatric Developmental Physiotherapy' },
      { title: 'Geriatric Mobility & Balance Therapy' },
      { title: 'Electrotherapy & Therapeutic Exercises' }
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
    icon: 'physio'
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
    { label: 'Disciplines', href: '#services' },
    { label: 'Rehabilitation', href: '#rehabilitation' },
    { label: 'All Services', href: '#procedures' },
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

        {/* Right Actions: Book Appointment & Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Book Appointment CTA */}
          <button
            onClick={onBookClick}
            className="px-4 sm:px-6 py-2 bg-black rounded-full text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [time, setTime] = useState<'Morning (9:00 AM – 1:00 PM)' | 'Evening (4:00 PM – 8:00 PM)'>('Morning (9:00 AM – 1:00 PM)');
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
      setErrorMsg('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preselectedService]);

  if (!isOpen) return null;

  const getFullEnquiryUrl = () => {
    const message = [
      '*CLINICAL CONSULTATION APPOINTMENT — SHREE CLINIC*',
      '----------------------------------------',
      `• *Patient Name:* ${name.trim() || 'Not specified'}`,
      `• *Contact Number:* ${phone.trim() || 'Not specified'}`,
      `• *Service Required:* ${selectedService}`,
      `• *Preferred Time:* ${time}`,
      concern.trim() ? `• *Health Concern:* ${concern.trim()}` : null,
      '----------------------------------------',
      'Sent from Shree Clinic Website'
    ].filter(Boolean).join('\n');

    return `https://wa.me/917995478069?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }

    const url = getFullEnquiryUrl();
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 md:p-7 shadow-2xl relative border-2 border-neutral-200 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-neutral-800 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="mb-3.5 pr-8">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#053543] uppercase bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Easy Consultation Booking
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-black tracking-tight leading-tight">
                Book an Appointment
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Simple 1-step form for patients and seniors. We will confirm your visit promptly.
              </p>
            </div>

            {/* Quick Call Box for Seniors */}
            <div className="mb-4 p-3 rounded-2xl bg-teal-50/70 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#053543] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs text-neutral-800">
                  <span className="font-semibold block text-neutral-900">Prefer to speak directly?</span>
                  <span>Call our clinic reception desk</span>
                </div>
              </div>
              <a
                href={CLINIC_PHONE_CALL}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#053543] text-white text-xs font-bold rounded-full hover:bg-[#0891b2] transition-colors shrink-0 shadow-sm"
              >
                <span>Call {CLINIC_PHONE}</span>
              </a>
            </div>

            {errorMsg && (
              <div className="p-3 mb-3 rounded-xl bg-red-50 border-2 border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Field 1: Patient Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5">
                  1. Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter patient name (e.g. Ramesh Kumar)"
                  className="w-full p-3.5 rounded-xl border-2 border-neutral-300 text-base font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 2: Phone Number */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5">
                  2. Mobile / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full p-3.5 rounded-xl border-2 border-neutral-300 text-base font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 3: Service Selection (Big Touch-Friendly Cards) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5">
                  3. Select Service Needed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'Audiology & Hearing Care',
                      label: 'Hearing Care',
                      sub: 'Ear & Hearing Aids',
                    },
                    {
                      id: 'Speech & Language Therapy',
                      label: 'Speech Therapy',
                      sub: 'Speech, Voice & Swallowing',
                    },
                    {
                      id: 'Physiotherapy & Mobility',
                      label: 'Physiotherapy',
                      sub: 'Joint, Back & Stroke Rehab',
                    }
                  ].map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setSelectedService(svc.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedService.includes(svc.label) || selectedService === svc.id
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                          : 'border-neutral-200 bg-stone-50 hover:border-neutral-400 text-neutral-800'
                      }`}
                    >
                      <span className="block text-sm font-bold leading-tight">{svc.label}</span>
                      <span className={`block text-[11px] mt-0.5 leading-tight ${
                        selectedService.includes(svc.label) || selectedService === svc.id
                          ? 'text-neutral-300'
                          : 'text-neutral-500'
                      }`}>
                        {svc.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Preferred Timing */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5">
                  4. Preferred Visit Timing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Morning (9:00 AM – 1:00 PM)',
                    'Evening (4:00 PM – 8:00 PM)'
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t as any)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center cursor-pointer ${
                        time === t
                          ? 'border-[#053543] bg-teal-50 text-[#053543]'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Brief Medical Note (Optional)
                </label>
                <input
                  type="text"
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  placeholder="e.g. Knee pain, hearing aid trial, speech delay"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>Send Appointment Request via WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-lg">
              ✓
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Appointment Request Sent!
            </h3>
            <p className="text-sm text-neutral-700 max-w-sm mx-auto mb-6 leading-relaxed">
              Your details for <strong className="text-neutral-900">{name}</strong> have been redirected to our clinic business line <strong className="font-mono text-neutral-900">{CLINIC_PHONE}</strong>. Our clinical coordinators will confirm your schedule.
            </p>

            <div className="p-4 rounded-2xl bg-stone-50 border border-neutral-200 text-left text-xs space-y-2 mb-6 max-w-sm mx-auto">
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 font-semibold">Patient:</span>
                <span className="font-bold text-neutral-900">{name}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 font-semibold">Phone:</span>
                <span className="font-bold text-neutral-900 font-mono">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 font-semibold">Service:</span>
                <span className="font-bold text-neutral-900">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Timing:</span>
                <span className="font-bold text-neutral-900">{time}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getFullEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Open WhatsApp Chat</span>
              </a>

              <a
                href={CLINIC_PHONE_CALL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-all shadow-md active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Clinic Reception</span>
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
  const [activeSubGroup, setActiveSubGroup] = useState<Record<string, number>>({});

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
        {/* 3 Clinical Feature Disciplines - High-Visibility Cards Styled with Logo Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 shrink-0 z-10">
          {clinicalDisciplines.map((item, i) => {
            const isAudiology = item.icon === 'audiology';
            const isSpeech = item.icon === 'speech';
            const isPhysio = item.icon === 'physio';

            const cardBorder = isAudiology
              ? 'border-teal-200/90 hover:border-[#053543]'
              : isSpeech
              ? 'border-cyan-200/90 hover:border-[#0891b2]'
              : 'border-lime-200/90 hover:border-[#65a30d]';

            const iconBg = isAudiology
              ? 'bg-[#053543] text-white shadow-sm'
              : isSpeech
              ? 'bg-[#0891b2] text-white shadow-sm'
              : 'bg-[#65a30d] text-white shadow-sm';

            const titleColor = isAudiology
              ? 'text-[#053543]'
              : isSpeech
              ? 'text-[#0891b2]'
              : 'text-[#3f6212]';

            const badgeColor = isAudiology
              ? 'bg-teal-50 text-[#053543] border border-teal-200'
              : isSpeech
              ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200'
              : 'bg-lime-50 text-[#4d7c0f] border border-lime-200';

            const arrowBg = isAudiology
              ? 'bg-teal-50 text-[#053543] group-hover:bg-[#053543] group-hover:text-white'
              : isSpeech
              ? 'bg-cyan-50 text-[#0891b2] group-hover:bg-[#0891b2] group-hover:text-white'
              : 'bg-lime-50 text-[#65a30d] group-hover:bg-[#65a30d] group-hover:text-white';

            return (
              <div
                key={item.id}
                ref={(el) => {
                  s1CardRefs.current[i] = el;
                }}
                style={s1Reveal.getAnimStyle(i)}
                onClick={() => {
                  handleSelectService(item.serviceIdx);
                  const el = document.getElementById(`category-${item.id}`) || document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full h-15 md:h-17 rounded-xl md:rounded-2xl p-3 md:p-3.5 bg-white shadow-sm hover:shadow-md border-2 ${cardBorder} transition-all duration-300 cursor-pointer group flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                    {item.icon === 'audiology' && <AudiologyMedicalIcon className="w-5 h-5 text-white" />}
                    {item.icon === 'speech' && <SpeechMedicalIcon className="w-5 h-5 text-white" />}
                    {item.icon === 'physio' && <PhysiotherapyMedicalIcon className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs md:text-sm font-bold tracking-tight truncate leading-tight ${titleColor}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] md:text-[11px] font-medium text-neutral-600 truncate leading-tight mt-0.5">
                      {item.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`hidden xl:inline text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>
                    Explore
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${arrowBg}`}>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
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
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0 shadow-sm border border-neutral-200"
          >
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md" />
            <div className="relative z-10 h-full p-5 md:p-7 flex flex-col justify-between border-l-4 border-l-[#053543]">
              <h2 className="text-[#053543] text-xl md:text-3xl font-bold tracking-tight">
                Clinical Facilities
              </h2>
              <p className="text-neutral-700 text-xs md:text-sm font-medium leading-relaxed max-w-sm">
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
            className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[220px] md:min-h-0 shadow-sm border border-neutral-200"
          >
            <div className="relative z-10 h-full p-4 md:p-6 flex flex-col justify-between">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#053543] uppercase bg-white/95 backdrop-blur-md border border-neutral-200/90 px-3.5 py-1.5 rounded-full w-fit shadow-md">
                DIAGNOSTIC & THERAPEUTIC CARE
              </span>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4 md:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-xl">
                <div className="text-neutral-900 text-xs md:text-sm font-semibold leading-relaxed max-w-xs">
                  Need personalized speech, hearing, or movement therapy?
                  <br />
                  <span className="text-[#0891b2] font-bold">Speak directly with our clinical coordinators.</span>
                </div>
                <div>
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="px-6 py-3.5 bg-[#053543] hover:bg-[#0891b2] rounded-full text-white text-xs md:text-sm font-bold transition-all active:scale-95 shadow-md whitespace-nowrap"
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
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0 shadow-sm border border-neutral-200"
          >
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md" />
            <div className="relative z-10 h-full p-5 md:p-7 flex flex-col justify-between border-l-4 border-l-[#65a30d]">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#4d7c0f] uppercase">
                RECOVERY ROADMAP
              </span>
              <h2 className="text-[#053543] text-[clamp(2.4rem,4.5vw,4.2rem)] font-bold leading-[0.88] tracking-tight">
                Patient
                <br />
                journey
              </h2>
            </div>
          </MaskedCard>

          {/* Card 3 - Bottom Full Width (3 Clinical Disciplines - Solid High-Contrast Cards) */}
          <div
            ref={(el) => {
              s2CardRefs.current[3] = el;
            }}
            style={s2Reveal.getAnimStyle(3)}
            className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl p-2 md:p-3 bg-stone-100 border border-neutral-200 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3 h-full">
              {activeServices.map((svc, idx) => {
                const isAudiology = svc.icon === 'audiology' || svc.id === 'audiology';
                const isSpeech = svc.icon === 'speech' || svc.id === 'speech';
                const isPhysio = svc.icon === 'physio' || svc.id === 'physio';

                const cardBorder = isAudiology
                  ? 'border-teal-200/90 hover:border-[#053543]'
                  : isSpeech
                  ? 'border-cyan-200/90 hover:border-[#0891b2]'
                  : 'border-lime-200/90 hover:border-[#65a30d]';

                const activeStyle = isAudiology
                  ? 'border-2 border-[#053543] ring-2 ring-[#053543]/20 bg-gradient-to-br from-teal-50/80 via-white to-white shadow-md'
                  : isSpeech
                  ? 'border-2 border-[#0891b2] ring-2 ring-[#0891b2]/20 bg-gradient-to-br from-cyan-50/80 via-white to-white shadow-md'
                  : 'border-2 border-[#65a30d] ring-2 ring-[#65a30d]/20 bg-gradient-to-br from-lime-50/80 via-white to-white shadow-md';

                const iconBg = isAudiology
                  ? 'bg-[#053543] text-white shadow-sm'
                  : isSpeech
                  ? 'bg-[#0891b2] text-white shadow-sm'
                  : 'bg-[#65a30d] text-white shadow-sm';

                const badgeStyle = isAudiology
                  ? 'bg-teal-50 text-[#053543] border border-teal-200 font-bold'
                  : isSpeech
                  ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200 font-bold'
                  : 'bg-lime-50 text-[#4d7c0f] border border-lime-200 font-bold';

                const actionTextColor = isAudiology
                  ? 'text-[#053543]'
                  : isSpeech
                  ? 'text-[#0891b2]'
                  : 'text-[#4d7c0f]';

                return (
                  <div
                    key={svc.id}
                    onClick={() => {
                      handleSelectService(idx);
                      const el = document.getElementById(`category-${svc.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full h-full rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 group bg-white shadow-sm hover:shadow-md ${cardBorder} ${
                      svc.active ? activeStyle : 'border-2 border-neutral-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl ${iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md`}>
                        {isAudiology && <AudiologyMedicalIcon className="w-6 h-6 text-white" />}
                        {isSpeech && <SpeechMedicalIcon className="w-6 h-6 text-white" />}
                        {isPhysio && <PhysiotherapyMedicalIcon className="w-6 h-6 text-white" />}
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
                        {svc.treatmentCount} Treatments
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-base md:text-xl font-bold leading-snug text-neutral-900 group-hover:text-black">
                        {svc.name.replace('\n', ' ')}
                      </h3>
                      <p className="text-xs text-neutral-700 font-medium mt-1.5 leading-relaxed line-clamp-2">
                        {svc.plainEnglishSummary}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-neutral-100">
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${actionTextColor}`}>
                        Explore Procedures
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${actionTextColor} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3 - REHABILITATION INTAKE (High-Contrast Grid)   */}
      {/* ======================================================== */}
      <section
        id="rehabilitation"
        ref={s3Reveal.containerRef}
        className="min-h-screen w-full flex flex-col pt-4 md:pt-6 px-3 md:px-5 pb-16 md:pb-24 gap-3 md:gap-4 relative"
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
                  alt="Pediatric child developmental speech and occupational therapy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden relative group border border-neutral-200">
                <img
                  src={SECTION3_IMG2}
                  alt="Manual physical therapy joint mobilization and spine rehabilitation"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* 3. Consultation Card (Deep Logo Teal) */}
            <div
              style={s3Reveal.getAnimStyle(2)}
              className="rounded-xl md:rounded-2xl bg-gradient-to-br from-[#053543] to-[#0a4352] p-5 md:p-7 flex items-end justify-between flex-[0.9] min-h-[150px] md:min-h-0 border border-[#053543] shadow-md text-white"
            >
              <div>
                <p className="text-xs md:text-sm font-semibold text-teal-200 mb-1.5 uppercase font-mono tracking-wider">
                  Consultation
                </p>
                <h3 className="text-lg md:text-2xl font-bold text-white leading-tight">
                  Clinical
                  <br />
                  Intake
                  <br />
                  Services
                </h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-5 py-3 md:px-7 md:py-4 bg-white rounded-full text-[#053543] text-sm md:text-base font-bold hover:bg-teal-50 hover:scale-105 transition-all shadow-md active:scale-95"
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
              alt="Audiologist specialist fitting pediatric digital hearing aid"
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
      {/* SECTION 4 - STRUCTURED CLINICAL PROCEDURES BREAKDOWN      */}
      {/* ======================================================== */}
      <section id="procedures" className="pt-28 md:pt-40 pb-20 md:pb-28 px-3 md:px-5 max-w-[1440px] mx-auto relative z-10 clear-both">
        <div className="mb-10 md:mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            CLINICAL DIRECTORY · STRUCTURED SPECIALTY SERVICES
          </span>
          <div>
            <h2 className="text-4xl md:text-7xl font-bold text-black leading-tight tracking-tight">
              Our Clinical Services
            </h2>
            <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl font-medium">
              Evidence-based clinical care across Audiology, Speech Language Pathology, and Physiotherapy. Structured assessment, diagnosis, and rehabilitation for every condition.
            </p>
          </div>

          {/* Interactive Department Filter Pills */}
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
              All Clinical Services
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
                {cat.icon === 'audiology' && <AudiologyMedicalIcon className="w-3.5 h-3.5" />}
                {cat.icon === 'speech' && <SpeechMedicalIcon className="w-3.5 h-3.5" />}
                {cat.icon === 'physio' && <PhysiotherapyMedicalIcon className="w-3.5 h-3.5" />}
                <span>{cat.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Department Cards */}
        <div className="space-y-14 md:space-y-16">
          {detailedClinicServices
            .filter((cat) => selectedCategoryTab === 'all' || selectedCategoryTab === cat.id)
            .map((category) => {
              const isAudiology = category.id === 'audiology';
              const isSpeech = category.id === 'speech';
              const isPhysio = category.id === 'physio';

              const accentColor = isAudiology
                ? 'bg-[#053543]'
                : isSpeech
                ? 'bg-[#0891b2]'
                : 'bg-[#65a30d]';

              const badgeColor = isAudiology
                ? 'bg-[#053543] text-white'
                : isSpeech
                ? 'bg-[#0891b2] text-white'
                : 'bg-[#65a30d] text-white';

              const btnColor = isAudiology
                ? 'bg-[#053543] hover:bg-[#0891b2] text-white'
                : isSpeech
                ? 'bg-[#0891b2] hover:bg-[#053543] text-white'
                : 'bg-[#65a30d] hover:bg-[#4d7c0f] text-white';

              const bulletHover = isAudiology
                ? 'group-hover/item:text-[#053543]'
                : isSpeech
                ? 'group-hover/item:text-[#0891b2]'
                : 'group-hover/item:text-[#65a30d]';

              return (
                <article
                  key={category.id}
                  id={`category-${category.id}`}
                  className="scroll-mt-28 bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden p-6 md:p-8 lg:p-10 transition-shadow hover:shadow-md"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* LEFT: Very Related Clinical Image, Photo Switcher & Department Booking */}
                    <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-28">
                      {(() => {
                        const activeGroupIdx = activeSubGroup[category.id] ?? 0;
                        const currentGroup = category.groups[activeGroupIdx] || category.groups[0];
                        const displayImage = currentGroup.image || category.image;
                        const displayBadge = currentGroup.imageBadge || category.imageBadge;
                        const displayAlt = currentGroup.imageAlt || category.imageAlt;

                        return (
                          <>
                            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-sm aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] bg-neutral-100 transition-all duration-300">
                              <img
                                key={displayImage}
                                src={displayImage}
                                alt={displayAlt}
                                className="w-full h-full object-cover object-center transition-all duration-500"
                                loading="lazy"
                              />
                              <div className={`absolute top-3.5 left-3.5 ${badgeColor} text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-md transition-all`}>
                                {displayBadge}
                              </div>
                              {/* Current Service Indicator on Image */}
                              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md rounded-xl p-2.5 text-white text-[11px] font-medium flex items-center justify-between shadow-lg">
                                <span className="truncate font-semibold">{currentGroup.number}. {currentGroup.title}</span>
                                <span className="shrink-0 text-[10px] font-mono text-neutral-300 uppercase pl-2">
                                  Image {activeGroupIdx + 1}/{category.groups.length}
                                </span>
                              </div>
                            </div>

                            {/* Sub-Service Photo Switcher Strip with Separate Real Photos */}
                            <div className="bg-stone-50 rounded-2xl p-3 md:p-3.5 border border-neutral-200/80 flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                                <span>Service Photos ({category.groups.length} Separate Images)</span>
                                <span className="text-[#053543] font-bold">Click photo to view</span>
                              </div>
                              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                                {category.groups.map((grp, gIdx) => {
                                  const isSelected = activeGroupIdx === gIdx;
                                  return (
                                    <button
                                      key={grp.number}
                                      type="button"
                                      onClick={() => setActiveSubGroup((prev) => ({ ...prev, [category.id]: gIdx }))}
                                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                                        isSelected
                                          ? `${isAudiology ? 'border-[#053543] ring-2 ring-[#053543]/40' : isSpeech ? 'border-[#0891b2] ring-2 ring-[#0891b2]/40' : 'border-[#65a30d] ring-2 ring-[#65a30d]/40'} scale-105 shadow-md`
                                          : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400'
                                      }`}
                                      title={`${grp.number}. ${grp.title}`}
                                    >
                                      <img src={grp.image} alt={grp.title} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white font-mono text-[9px] px-1 rounded font-bold">
                                        {grp.number}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      <div className="bg-stone-50 rounded-2xl p-4 md:p-5 border border-neutral-200/80 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 font-bold uppercase tracking-wider">
                          <span>{category.shortName}</span>
                          <span>{category.groups.reduce((acc, g) => acc + g.items.length, 0)} Conditions Treated</span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                          {category.tagline}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleInquireTreatment(category.shortName)}
                          className={`w-full py-3 px-5 rounded-full ${btnColor} text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95`}
                        >
                          <span>Book {category.shortName} Consultation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* RIGHT: Structured Sub-Services matching Reference Image */}
                    <div className="lg:col-span-7">
                      {/* Header directly styled like the reference image */}
                      <div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
                          {category.name}
                        </h3>
                        {/* Accent line bar with department logo color */}
                        <div className={`h-1.5 w-20 ${accentColor} rounded-full mt-2.5 mb-5`} />
                      </div>

                      {/* Subtitle directly matching reference image */}
                      <h4 className="text-base md:text-lg font-bold text-neutral-900 mb-6">
                        {category.subtitle}
                      </h4>

                      {/* Numbered Sub-Service Groups in Clean 2-Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                        {category.groups.map((group, gIdx) => {
                          const activeGroupIdx = activeSubGroup[category.id] ?? 0;
                          const isSelected = activeGroupIdx === gIdx;
                          return (
                            <div
                              key={group.title}
                              onClick={() => setActiveSubGroup((prev) => ({ ...prev, [category.id]: gIdx }))}
                              className={`flex flex-col p-3.5 rounded-2xl transition-all cursor-pointer border ${
                                isSelected
                                  ? `${isAudiology ? 'bg-teal-50/80 border-teal-300 shadow-sm ring-1 ring-teal-200' : isSpeech ? 'bg-cyan-50/80 border-cyan-300 shadow-sm ring-1 ring-cyan-200' : 'bg-lime-50/80 border-lime-300 shadow-sm ring-1 ring-lime-200'}`
                                  : 'border-neutral-200/70 hover:bg-stone-50 hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <h5 className="text-sm md:text-base font-bold text-neutral-900 flex items-baseline gap-1.5 leading-snug">
                                  <span className="font-bold">{group.number}.</span>
                                  <span>{group.title}</span>
                                </h5>
                                <span className={`shrink-0 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase transition-all ${
                                  isSelected
                                    ? `${badgeColor} shadow-xs`
                                    : 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200'
                                }`}>
                                  {isSelected ? 'Active Photo' : 'View Photo'}
                                </span>
                              </div>
                              <ul className="space-y-1.5 pl-0.5">
                                {group.items.map((item) => (
                                  <li
                                    key={item}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInquireTreatment(item);
                                    }}
                                    className="flex items-start gap-2 text-xs md:text-sm text-neutral-700 leading-snug cursor-pointer group/item hover:text-black transition-colors"
                                  >
                                    {/* Bullseye Icon matching reference image ⦿ */}
                                    <span className={`shrink-0 mt-0.5 text-neutral-600 ${bulletHover} transition-colors`}>
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.8" />
                                        <circle cx="8" cy="8" r="2.2" fill="currentColor" />
                                      </svg>
                                    </span>
                                    <span className="font-medium group-hover/item:underline">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </article>
              );
            })}
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
      {/* 09. FLOATING WHATSAPP BUTTON (Instant Patient Support)    */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with SHREE Clinic on WhatsApp: ${CLINIC_PHONE}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group font-medium text-xs border border-emerald-500/30"
          title={`WhatsApp Inquiry: ${CLINIC_PHONE}`}
        >
          <WhatsAppIcon className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-wide">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
