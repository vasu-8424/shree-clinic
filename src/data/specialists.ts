export interface Specialist {
  id: string;
  role: string;
  department: "Audiology" | "Speech Therapy" | "Rehabilitation";
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
    id: "specialist-pediatric",
    role: "Pediatric Rehabilitation & Child Development Consultant",
    department: "Rehabilitation",
    name: "[CLINICAL SPECIALIST NAME — TO BE ANNOUNCED]",
    qualification: "Clinical Developmental Fellow [CONTENT REQUIRED]",
    registration: "Licensed Healthcare Allied Professional [CONTENT REQUIRED]",
    focus: "Early Child Development, Sensory Integration, Speech Delays & Social Communication",
    bio: "Passionate child developmental therapist helping children achieve vital communicative and cognitive milestones through engaging, family-integrated clinical protocols.",
    availableDays: "Monday – Saturday"
  }
];
