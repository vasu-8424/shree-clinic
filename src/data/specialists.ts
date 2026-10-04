export interface Specialist {
  id: string;
  role: string;
  department: "Audiology" | "Speech Therapy" | "Physiotherapy" | "Rehabilitation";
  name: string;
  qualification: string;
  registration: string;
  focus: string;
  bio: string;
  availableDays: string;
}

export const specialistsData: Specialist[] = [
  {
    id: "specialist-audiology",
    role: "Lead Audiologist & Hearing Rehabilitation Specialist",
    department: "Audiology",
    name: "[CLINICAL SPECIALIST NAME — TO BE ANNOUNCED]",
    qualification: "MASLP / BASLP [CREDENTIAL TO BE CONFIRMED]",
    registration: "RCI Registered Professional [CONTENT REQUIRED]",
    focus: "Diagnostic Audiometry, Real-Ear Hearing Aid Verification & Pediatric Sound Profiling",
    bio: "Clinical audiology practice dedicated to objective acoustic diagnostics, patient-centered hearing technology fitting, and long-term auditory rehabilitation.",
    availableDays: "Monday – Saturday"
  },
  {
    id: "specialist-speech",
    role: "Senior Speech-Language Pathologist",
    department: "Speech Therapy",
    name: "[CLINICAL SPECIALIST NAME — TO BE ANNOUNCED]",
    qualification: "MASLP / MSc Speech-Language Pathology [CONTENT REQUIRED]",
    registration: "RCI Registered Professional [CONTENT REQUIRED]",
    focus: "Pediatric Speech Delay, Neurogenic Aphasia, Stuttering & Dysphagia Management",
    bio: "Experienced speech-language clinician specializing in communication disorders across all life stages, pairing compassionate bedside care with evidence-based phonetic therapies.",
    availableDays: "Tuesday – Saturday"
  },
  {
    id: "specialist-physio",
    role: "Chief Physiotherapist & Rehabilitation Director",
    department: "Physiotherapy",
    name: "[CLINICAL SPECIALIST NAME — TO BE ANNOUNCED]",
    qualification: "MPT / BPT [CREDENTIAL TO BE CONFIRMED]",
    registration: "State Allied Healthcare Council [CONTENT REQUIRED]",
    focus: "Neuro-Rehabilitation, Post-Surgical Orthopedics, Gait Retraining & Spine Dynamics",
    bio: "Focusing on motor recovery, musculoskeletal kinetics, and tailored exercise rehabilitation to return patients to confident, pain-free daily activities.",
    availableDays: "Monday – Friday"
  },
  {
    id: "specialist-pediatric",
    role: "Pediatric Rehabilitation & Child Development Consultant",
    department: "Rehabilitation",
    name: "[CLINICAL SPECIALIST NAME — TO BE ANNOUNCED]",
    qualification: "Clinical Developmental Fellow [CONTENT REQUIRED]",
    registration: "Licensed Healthcare Allied Professional [CONTENT REQUIRED]",
    focus: "Early Child Development, Sensory Integration, Torticollis & Motor Coordination",
    bio: "Passionate child developmental therapist helping children achieve vital communicative and motor milestones through engaging, family-integrated clinical protocols.",
    availableDays: "Monday – Saturday"
  }
];
