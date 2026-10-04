export interface ClinicInfo {
  name: string;
  tagline: string;
  emotionalKicker: string;
  brandConcepts: {
    path: string;
    tree: string;
    sun: string;
    people: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    mapCoordinates?: { lat: number; lng: number };
  };
}

export const clinicData: ClinicInfo = {
  name: "SHREE",
  tagline: "Care that helps you move forward.",
  emotionalKicker: "Better hearing. Better communication. Better movement.",
  brandConcepts: {
    path: "Every patient has an individual healthcare journey tailored with patience and precision.",
    tree: "Growth, rehabilitation, and long-term sustainable wellbeing rooted in clinical evidence.",
    sun: "Hope, measurable progress, and a confident future for patients and their families.",
    people: "Human-centred care uniting specialists, patients, and loved ones as one."
  },
  contact: {
    phone: "+91 [CONTACT REQUIRED]",
    whatsapp: "+91 [CONTACT REQUIRED]",
    email: "care@shreeclinic.com",
    address: "[CLINIC ADDRESS TO BE CONFIRMED ON LAUNCH], India",
    hours: "Monday – Saturday: 09:00 AM – 07:00 PM · Sunday: By Appointment"
  }
};
