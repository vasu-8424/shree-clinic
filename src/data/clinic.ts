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
    plusCode?: string;
    facility?: string;
    hours: string;
    mapUrl?: string;
    mapEmbedUrl?: string;
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
    phone: "+91 99499 61044",
    whatsapp: "+91 99499 61044",
    email: "nimmasakethreddy23@gmail.com",
    address: "SY.NO.196/P, GROUNDFLOOR, LLP, FREEDOM HOSPITALS, SUBISHI TOWN CENTER, Shankarpalli, Mokila, Hyderabad, Telangana 501203",
    plusCode: "C5QM+PX Mokila, Telangana",
    facility: "Freedom Hospitals, Subishi Town Center",
    hours: "Monday to Saturday: 9:00 AM to 7:00 PM · Sunday: By prior appointment",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=FREEDOM+HOSPITALS+SUBISHI+TOWN+CENTER+Mokila+Hyderabad+Telangana+501203",
    mapEmbedUrl: "https://maps.google.com/maps?q=FREEDOM%20HOSPITALS%2C%20SUBISHI%20TOWN%20CENTER%2C%20Shankarpalli%2C%20Mokila%2C%20Hyderabad%2C%20Telangana%20501203&t=&z=16&ie=UTF8&iwloc=&output=embed"
  }
};
