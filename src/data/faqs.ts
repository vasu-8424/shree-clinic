export interface FAQItem {
  id: string;
  category: "General" | "Audiology" | "Speech Therapy";
  question: string;
  answer: string;
}

export const faqsData: FAQItem[] = [
  {
    id: "appointment-need",
    category: "General",
    question: "Do I need an appointment at Shree Clinic?",
    answer: "Prior appointments are strongly recommended to ensure sufficient, unhurried time with your specialist. However, walk-in support is available for urgent hearing aid cleaning, urgent device checks, and preliminary clinic inquiries."
  },
  {
    id: "age-groups",
    category: "General",
    question: "What age groups do you treat at Shree Clinic?",
    answer: "From a baby's first sounds to a senior's hearing health, we care for every age: from neonates and toddlers requiring early developmental speech intervention, to active working adults, and seniors needing hearing aids and speech rehabilitation."
  },
  {
    id: "treat-children",
    category: "General",
    question: "Do you treat children?",
    answer: "Yes, our team has dedicated pediatric care pathways across Audiology (OAE newborn screening, developmental hearing tests), Speech Therapy (speech delays, articulation, stuttering, autism spectrum communication), and Early Child Development."
  },
  {
    id: "hearing-assessment",
    category: "Audiology",
    question: "What happens during a hearing assessment?",
    answer: "A comprehensive assessment starts with otoscopy to inspect the outer ear canal, followed by Pure Tone Audiometry inside a sound-treated acoustic environment to determine your exact hearing thresholds. Tympanometry and speech discrimination testing are conducted as clinically indicated."
  },
  {
    id: "speech-therapy-work",
    category: "Speech Therapy",
    question: "How does speech therapy work?",
    answer: "Speech therapy begins with a standardized clinical evaluation assessing expressive speech, comprehension, oral motor mechanics, or swallowing dynamics. Individualized weekly sessions then utilize systematic exercises, biofeedback, and guided home practices."
  },
  {
    id: "therapy-duration",
    category: "General",
    question: "How long does therapy take?",
    answer: "Therapy duration varies according to each patient's specific condition and initial baseline. Following your comprehensive assessment, your clinical specialist will establish clear functional milestones and outline an estimated timeframe with periodic reviews."
  },
  {
    id: "home-visits",
    category: "General",
    question: "Do you provide home visits?",
    answer: "Yes, home visits are available for speech-language therapy, dysphagia swallowing therapy, and hearing aid testing, trials & fittings for patients who are bed-bound, elderly, or have mobility limitations, subject to initial clinical evaluation and location availability."
  },
  {
    id: "pre-booking-call",
    category: "General",
    question: "Can I speak to someone before booking?",
    answer: "Yes, our clinical care coordinators at Shree Clinic are available via phone and WhatsApp (+91 99499 61044) to discuss your concerns, explain the diagnostic process, and guide you to the most appropriate specialty department before you schedule."
  }
];
