import React, { useEffect } from 'react';

export const SeoStructuredData: React.FC = () => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      "name": "Shree Clinic",
      "alternateName": [
        "Shree Clinic Mokila",
        "Shree Clinic Hyderabad",
        "Shree Speech Hearing and Rehabilitation Clinic",
        "SHREE Clinic"
      ],
      "description": "Shree Clinic is a premier clinic in Mokila, Hyderabad offering specialized Speech Therapy, Audiology, Digital Hearing Aids, and Speech Rehabilitation.",
      "medicalSpecialty": [
        "Audiology",
        "SpeechTherapy"
      ],
      "availableService": [
        {
          "@type": "MedicalTest",
          "name": "Pure Tone Audiometry (PTA)"
        },
        {
          "@type": "MedicalTherapy",
          "name": "Speech and Language Therapy"
        },
        {
          "@type": "MedicalTest",
          "name": "Tympanometry & Pediatric OAE Screening"
        },
        {
          "@type": "MedicalTherapy",
          "name": "VitalStim Therapy for Dysphagia"
        },
        {
          "@type": "MedicalDevice",
          "name": "Digital Hearing Aid Evaluation and Fitting"
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
