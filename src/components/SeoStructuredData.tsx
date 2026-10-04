import React, { useEffect } from 'react';

export const SeoStructuredData: React.FC = () => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      "name": "SHREE — Multidisciplinary Healthcare",
      "description": "Ultra-premium multidisciplinary clinic offering Audiology, Speech Therapy, Physiotherapy, and Integrated Neuro-Rehabilitation.",
      "medicalSpecialty": [
        "Audiology",
        "SpeechTherapy",
        "Physiotherapy"
      ],
      "availableService": [
        {
          "@type": "MedicalTest",
          "name": "Pure Tone Audiometry"
        },
        {
          "@type": "MedicalTherapy",
          "name": "Speech and Language Therapy"
        },
        {
          "@type": "MedicalTherapy",
          "name": "Neurological and Musculoskeletal Physiotherapy"
        },
        {
          "@type": "MedicalTherapy",
          "name": "VitalStim Therapy for Dysphagia"
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};
