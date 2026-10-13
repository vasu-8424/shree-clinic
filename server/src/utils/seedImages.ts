import { prisma } from '../config/prisma.js';

export interface DefaultImageItem {
  key: string;
  title: string;
  section: string;
  description: string;
  defaultUrl: string;
}

export const INITIAL_WEBSITE_IMAGES: DefaultImageItem[] = [
  {
    key: 'hero_image',
    title: 'Hero Clinic Suite',
    section: 'Hero',
    description: 'Main clinical treatment room featured in the top hero background',
    defaultUrl: '/images/hero-clinic-room.jpg',
  },
  {
    key: 'clinic_facility_reception',
    title: 'Clinic Facilities & Reception',
    section: 'Facilities',
    description: 'Reception and clinical facility card mosaic background in Section 2',
    defaultUrl: '/images/clinic-facility-reception.jpg',
  },
  {
    key: 'hearing_aid_fitting',
    title: 'Rehabilitation Hero Card',
    section: 'Rehabilitation',
    description: 'Tall feature image card in the clinical rehabilitation section',
    defaultUrl: '/images/hearing-aid-fitting.jpg',
  },
  {
    key: 'speech_pediatric_therapy',
    title: 'Pediatric Speech Therapy',
    section: 'Speech Therapy',
    description: 'Speech-language pathologist working with child on speech flashcards',
    defaultUrl: '/images/speech-pediatric-therapy.png',
  },
  {
    key: 'speech_adult_therapy',
    title: 'Adult Speech Therapy & SPEAK OUT!',
    section: 'Speech Therapy',
    description: 'Adult neuro-rehabilitation and voice therapy session',
    defaultUrl: '/images/speech-adult-therapy.png',
  },
  {
    key: 'vitalstim_swallowing',
    title: 'VitalStim® Swallowing Therapy',
    section: 'Speech Therapy',
    description: 'VitalStim Plus NMES electrotherapy and sEMG biofeedback device',
    defaultUrl: '/images/vitalstim-swallowing-therapy.png',
  },
  {
    key: 'audiology_soundproof_booth',
    title: 'Soundproof Audiology Suite',
    section: 'Audiology',
    description: 'Pure Tone Audiometry (PTA) soundproof booth diagnostic testing',
    defaultUrl: '/images/audiology-soundproof-booth.png',
  },
  {
    key: 'audiology_middle_ear',
    title: 'Tympanometry & Middle Ear Exam',
    section: 'Audiology',
    description: 'Middle ear impedance, compliance and acoustic reflex diagnostics',
    defaultUrl: '/images/audiology-middle-ear-exam.jpg',
  },
  {
    key: 'audiology_pediatric_screening',
    title: 'Pediatric Hearing Screening',
    section: 'Audiology',
    description: 'Visual reinforcement and play audiometry for toddlers and children',
    defaultUrl: '/images/audiology-pediatric-screening.jpg',
  },
  {
    key: 'audiology_digital_hearing_aids',
    title: 'Digital Hearing Aids & Fitting',
    section: 'Audiology',
    description: 'Modern rechargeable hearing aid demonstration and trial',
    defaultUrl: '/images/audiology-digital-hearing-aids.jpg',
  },
  {
    key: 'audiology_tinnitus_consultation',
    title: 'Tinnitus & Ear Care Consultation',
    section: 'Audiology',
    description: 'Acoustic masking and relief therapy for ear ringing',
    defaultUrl: '/images/audiology-tinnitus-consultation.jpg',
  },
  {
    key: 'physiotherapy_clinic_rehab',
    title: 'Physiotherapy & Rehabilitation Studio',
    section: 'Physiotherapy',
    description: 'Clinical physiotherapy table, gym balls, and posture correction equipment',
    defaultUrl: '/images/physiotherapy-clinic-rehab.jpg',
  },
  {
    key: 'shree_logo',
    title: 'Clinic Official Logo',
    section: 'Brand',
    description: 'Official SHREE Multidisciplinary Healthcare Clinic logo',
    defaultUrl: '/shree-logo.png',
  },
];

/**
 * Ensures all website images exist in the database with their defaults.
 */
export async function ensureDefaultWebsiteImages(): Promise<void> {
  try {
    for (const item of INITIAL_WEBSITE_IMAGES) {
      await prisma.websiteImage.upsert({
        where: { key: item.key },
        create: {
          key: item.key,
          title: item.title,
          section: item.section,
          description: item.description,
          defaultUrl: item.defaultUrl,
          imageUrl: item.defaultUrl,
        },
        update: {
          title: item.title,
          section: item.section,
          description: item.description,
          defaultUrl: item.defaultUrl,
          // do NOT overwrite imageUrl if custom already exists
        },
      });
    }
  } catch (err) {
    console.error('Error ensuring default website images in DB:', err);
  }
}
