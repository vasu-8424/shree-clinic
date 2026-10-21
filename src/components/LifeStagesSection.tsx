import React, { useState } from 'react';
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Baby,
  User,
  Users,
  HeartPulse,
  Activity,
  Ear,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface LifeStagesSectionProps {
  onBookStage: (stageService: string) => void;
}

export interface LifeStageCardData {
  id: string;
  stageName: string;
  ageBracket: string;
  tagline: string;
  gradient: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  image: string;
  imageAlt: string;
  icon: 'baby' | 'child' | 'adult' | 'senior' | 'swallowing' | 'hearing';
  conditions: string[];
  whyItMatters: string;
  recommendedService: string;
  phoneMessage: string;
}

const LIFE_STAGES: LifeStageCardData[] = [
  {
    id: 'infants',
    stageName: 'Infants & Toddlers',
    ageBracket: '0 – 3 Years',
    tagline: 'Early Developmental Milestones & Hearing Screening',
    gradient: 'from-teal-600/10 via-cyan-500/5 to-white',
    accentColor: 'border-teal-500/30',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    badgeText: 'Early Intervention',
    image: '/images/speech-pediatric-therapy.png',
    imageAlt: 'Infant and toddler speech and developmental hearing screening',
    icon: 'baby',
    conditions: [
      'Newborn Hearing Screening (OAE & Early PTA)',
      'Speech & Babbling Delays (No words by 12–18 mos)',
      'Pediatric Motor Delay & Torticollis Exercises',
      'Early Feeding & Swallowing Guidance'
    ],
    whyItMatters: 'Intervention in the first 1,000 days capitalizes on neuroplasticity to build foundational speech and hearing clarity.',
    recommendedService: 'Pediatric Speech & Language Therapy',
    phoneMessage: 'Hello Shree Clinic, I would like to inquire about Infant/Toddler developmental assessment.'
  },
  {
    id: 'children',
    stageName: 'Children & Adolescents',
    ageBracket: '4 – 15 Years',
    tagline: 'Speech Clarity, Sound Pronunciation & Motor Therapy',
    gradient: 'from-cyan-600/10 via-sky-500/5 to-white',
    accentColor: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    badgeText: 'Child Development',
    image: '/images/speech-pediatric-therapy.png',
    imageAlt: 'Speech-language pathologist working with school-age child with flashcards',
    icon: 'child',
    conditions: [
      'Speech & Language Therapy for Delay & Vocabulary',
      'Sound Articulation & Pronunciation Correction',
      'Stuttering & Stammering Fluency Therapy',
      'Autism Spectrum Communication Support (AAC)',
      'Pediatric Physiotherapy for Posture & Coordination'
    ],
    whyItMatters: 'Empowering children with self-confidence in the classroom and joyful everyday peer conversation.',
    recommendedService: 'Pediatric Speech & Language Therapy',
    phoneMessage: 'Hello Shree Clinic, I would like to book a Child Speech / Motor assessment.'
  },
  {
    id: 'adults',
    stageName: 'Working Adults',
    ageBracket: '18 – 55 Years',
    tagline: 'Spine Health, Pain Relief & Professional Voice Care',
    gradient: 'from-lime-600/10 via-emerald-500/5 to-white',
    accentColor: 'border-lime-500/30',
    badgeBg: 'bg-lime-50 text-lime-800 border-lime-200',
    badgeText: 'Active Professionals',
    image: '/images/physiotherapy-clinic-rehab.jpg',
    imageAlt: 'Adult physiotherapy and back pain rehabilitation in modern studio',
    icon: 'adult',
    conditions: [
      'Computer Posture Neck Strain, Sciatica & Low Back Pain',
      'Sports Injury & Joint Mobilization Physiotherapy',
      'Voice Therapy for Teachers, Callers & Vocal Fatigue',
      'Tinnitus (Ear Ringing) Assessment & Noise Protection',
      'Sudden Hearing Changes & Occupational Assessments'
    ],
    whyItMatters: 'Drug-free physical recovery and vocal endurance to keep you thriving at work and in daily life.',
    recommendedService: 'Orthopedic Physiotherapy',
    phoneMessage: 'Hello Shree Clinic, I would like to book an Adult Physiotherapy / Hearing appointment.'
  },
  {
    id: 'seniors',
    stageName: 'Seniors & Golden Age',
    ageBracket: '60+ Years',
    tagline: 'Hearing Aid Care, Mobility & Stroke Neuro-Rehab',
    gradient: 'from-amber-600/10 via-teal-500/5 to-white',
    accentColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeText: 'Senior Independence',
    image: '/images/speech-adult-therapy.png',
    imageAlt: 'Senior adult speech neuro-rehabilitation and hearing aid consultation',
    icon: 'senior',
    conditions: [
      'Digital Hearing Aid Trials, Fitting & Computer Tuning',
      'Post-Stroke Rehabilitation (Aphasia & Hemiplegia)',
      'Balance Training & Safe Walking Fall Prevention',
      'Age-Related Knee Osteoarthritis Joint Therapy',
      'Home-Based Therapy Visits for Bed-Bound Patients'
    ],
    whyItMatters: 'Restoring effortless conversation with family, dining safety, and independent, stable mobility.',
    recommendedService: 'Hearing Aid Evaluation & Fitting',
    phoneMessage: 'Hello Shree Clinic, I would like to inquire about Senior hearing aid / rehabilitation care.'
  },
  {
    id: 'swallowing',
    stageName: 'Dysphagia & VitalStim®',
    ageBracket: 'All Ages',
    tagline: 'Advanced Neuromuscular Electrical Stimulation (NMES)',
    gradient: 'from-sky-600/10 via-blue-500/5 to-white',
    accentColor: 'border-sky-500/30',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeText: 'Advanced Swallowing Care',
    image: '/images/vitalstim-swallowing-therapy.png',
    imageAlt: 'VitalStim Plus Electrotherapy and sEMG Biofeedback swallowing device',
    icon: 'swallowing',
    conditions: [
      'Clinical Swallowing Assessment in Adults & Children',
      'VitalStim® Plus Electrotherapy with sEMG Biofeedback',
      'Post-Stroke & Post-Surgical Swallowing Rehabilitation',
      'Targeted Pharyngeal Musculature Muscle Retraining',
      'Safe Deglutition Diet & Choking Prevention Protocols'
    ],
    whyItMatters: 'Evidence-based therapy to regain safe natural eating and drinking, eliminating feeding tube reliance.',
    recommendedService: 'VitalStim® Therapy',
    phoneMessage: 'Hello Shree Clinic, I would like to book a VitalStim / Swallowing consultation.'
  },
  {
    id: 'audiology-suite',
    stageName: 'Diagnostic Audiology Suite',
    ageBracket: 'All Generations',
    tagline: 'Soundproof Booth Acoustic Precision Testing',
    gradient: 'from-[#053543]/10 via-teal-500/5 to-white',
    accentColor: 'border-[#053543]/30',
    badgeBg: 'bg-teal-50 text-[#053543] border-teal-200',
    badgeText: 'Hospital-Grade Diagnostics',
    image: '/images/audiology-diagnostic-tests.jpg',
    imageAlt: 'Pure tone audiometry hearing assessment inside soundproof booth',
    icon: 'hearing',
    conditions: [
      'Pure Tone Audiometry (PTA – Air & Bone Conduction)',
      'Speech Audiometry & Word Discrimination in Noise',
      'Tympanometry & Middle Ear Pressure Assessment',
      'Free Multi-Brand Digital Hearing Aid Demonstrations',
      'Custom Noise Protection & Soft Silicone Ear Molds'
    ],
    whyItMatters: 'Hospital-grade sound isolation ensures 100% accurate threshold detection for prompt treatment.',
    recommendedService: 'Pure Tone Audiometry (PTA)',
    phoneMessage: 'Hello Shree Clinic, I would like to book a Pure Tone Hearing Test in the soundproof booth.'
  }
];

export const LifeStagesSection: React.FC<LifeStagesSectionProps> = ({ onBookStage }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pediatric' | 'adult' | 'senior'>('all');

  const filteredStages = LIFE_STAGES.filter((stage) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pediatric') return stage.id === 'infants' || stage.id === 'children';
    if (selectedFilter === 'adult') return stage.id === 'adults' || stage.id === 'swallowing';
    if (selectedFilter === 'senior') return stage.id === 'seniors' || stage.id === 'swallowing' || stage.id === 'audiology-suite';
    return true;
  });

  return (
    <section
      id="life-stages"
      className="py-20 md:py-28 px-3 md:px-5 max-w-[1440px] mx-auto border-t border-neutral-100"
      aria-label="Clinical Care for Every Stage of Life"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#053543] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500">
              HEALTHCARE FOR EVERY GENERATION · ALL STAGES OF LIFE
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight leading-tight">
            Care for Every Stage of Life
          </h2>
          <p className="text-sm md:text-base text-neutral-600 mt-2 max-w-2xl font-medium leading-relaxed">
            From a baby’s first sounds to a grandparent’s recovery — our integrated clinic provides compassionate,
            evidence-based Audiology, Speech-Language Therapy, and Physiotherapy tailored for your loved one.
          </p>
        </div>

        {/* Quick Age Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {[
            { id: 'all', label: 'All Life Stages' },
            { id: 'pediatric', label: 'Infants & Children' },
            { id: 'adult', label: 'Working Adults' },
            { id: 'senior', label: 'Seniors & Elders' }
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-[#053543] text-white shadow-md'
                  : 'bg-stone-100 hover:bg-stone-200 text-neutral-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6-Card Visual Showcase (Inspired by Reference Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 items-stretch">
        {filteredStages.map((card) => {
          return (
            <div
              key={card.id}
              className={`rounded-3xl border ${card.accentColor} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group`}
            >
              {/* TOP VISUAL HEADER with Framed Photo and Geometric Accent */}
              <div className={`p-5 md:p-6 bg-gradient-to-b ${card.gradient} border-b border-neutral-100 relative`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border shadow-2xs ${card.badgeBg}`}>
                    {card.badgeText}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-500 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-neutral-200 shadow-2xs">
                    {card.ageBracket}
                  </span>
                </div>

                {/* Framed Clinical Photo (Hexagonal / Geometric Aesthetic) */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-[1.02] transition-transform duration-500 bg-neutral-100">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between">
                    <span className="text-xs font-bold truncate drop-shadow-sm">{card.stageName}</span>
                    <span className="text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white/90">
                      Verified Care
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug group-hover:text-[#053543] transition-colors">
                    {card.stageName}
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium mt-1 leading-relaxed">
                    {card.tagline}
                  </p>
                </div>
              </div>

              {/* CARD BODY: Conditions Treated & Clinical Significance */}
              <div className="p-5 md:p-6 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                    Common Conditions Treated:
                  </span>
                  <ul className="space-y-2 mb-4">
                    {card.conditions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-xl bg-stone-50 border border-neutral-200/80 mb-4 text-[11px] text-neutral-600 italic leading-relaxed">
                    "{card.whyItMatters}"
                  </div>
                </div>

                {/* DIRECT CONTACT & APPOINTMENT BOOKING ACTION BAR */}
                <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs text-neutral-600 font-semibold">
                    <span className="text-neutral-500 font-mono text-[11px]">Direct Reception:</span>
                    <a
                      href="tel:+917995478069"
                      className="inline-flex items-center gap-1 text-[#053543] hover:text-[#0891b2] font-bold"
                    >
                      <Phone className="w-3 h-3" />
                      <span>+91 79954 78069</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/917995478069?text=${encodeURIComponent(card.phoneMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onBookStage(card.recommendedService)}
                      className="py-2.5 px-3 rounded-full bg-[#053543] hover:bg-[#0891b2] text-white text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Book Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Hospital Support Footer Banner */}
      <div className="mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-stone-50 via-teal-50/40 to-stone-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#053543] text-white flex items-center justify-center shrink-0 shadow-md">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-base font-bold text-neutral-900 leading-snug">
              Unsure which therapy is right for your family member?
            </h4>
            <p className="text-xs text-neutral-600 mt-0.5 font-medium">
              Speak directly with our clinical coordinators at Freedom Hospitals, Mokila. We guide you to the right department.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:+917995478069"
            className="px-5 py-2.5 rounded-full bg-[#053543] text-white text-xs font-bold hover:bg-[#0891b2] transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call +91 79954 78069</span>
          </a>
        </div>
      </div>
    </section>
  );
};
