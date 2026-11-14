export interface ResourceArticle {
  id: string;
  category: "Hearing" | "Speech" | "Language" | "Swallowing" | "Rehabilitation" | "Child Development";
  title: string;
  excerpt: string;
  readTime: string;
  publishedDate: string;
  keyTakeaways: string[];
}

export const resourcesData: ResourceArticle[] = [
  {
    id: "early-speech-milestones",
    category: "Child Development",
    title: "Understanding Speech & Language Milestones in the First Three Years",
    excerpt: "Recognizing early communicative signals, babbling varieties, and first words—and when clinical guidance can gently accelerate communication.",
    readTime: "5 min read",
    publishedDate: "Clinical Review",
    keyTakeaways: [
      "Speech vs language: distinguishing phonetic sound production from receptive language comprehension.",
      "Red flags at 18 and 24 months that warrant an unhurried, gentle pediatric evaluation.",
      "How daily verbal responsive interactions shape early neural linguistic pathways."
    ]
  },
  {
    id: "adult-hearing-health",
    category: "Hearing",
    title: "The Subtle Shift: Recognizing Early Changes in High-Frequency Hearing",
    excerpt: "Why background noise in restaurants or family gatherings is often the first acoustic signal—and how early acoustic intervention preserves cognitive vitality.",
    readTime: "6 min read",
    publishedDate: "Audiology Insights",
    keyTakeaways: [
      "The relationship between auditory cortex stimulation and cognitive retention in adults.",
      "What Pure Tone Audiometry and Speech-in-Noise tests actually measure.",
      "Modern discreet digital amplification: from acoustic verification to effortless connectivity."
    ]
  },
  {
    id: "post-stroke-neuroplasticity",
    category: "Rehabilitation",
    title: "Neuroplasticity in Action: Speech & Swallowing Recovery",
    excerpt: "How co-managing speech retraining and safe deglutition within one unified clinical team optimizes post-stroke recovery.",
    readTime: "7 min read",
    publishedDate: "Speech Rehabilitation Review",
    keyTakeaways: [
      "Why repetitive, task-specific language exercises rebuild damaged neural communication pathways.",
      "Aphasia rehabilitation: pairing communicative practice with family engagement.",
      "Managing dysphagia early to guarantee safe nutrition and prevent aspiration risks."
    ]
  },
  {
    id: "vitalstim-dysphagia-care",
    category: "Swallowing",
    title: "Clinical Approaches to Dysphagia: Safe Deglutition & VitalStim Therapy",
    excerpt: "A clinical overview of neuromuscular electrical stimulation (NMES) combined with swallow maneuver exercises for pharyngeal muscular re-education.",
    readTime: "5 min read",
    publishedDate: "Clinical Therapeutics",
    keyTakeaways: [
      "Identifying silent aspiration and subtle coughing during meals in elderly patients.",
      "How neuromuscular electrical stimulation assists pharyngeal muscle contraction.",
      "Diet texture modifications that maintain nutrition while ensuring airway safety."
    ]
  }
];
