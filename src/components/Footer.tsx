import React from 'react';
import { ShreeLogo } from './ShreeLogo';
import { clinicData } from '../data/clinic';

interface FooterProps {
  onBookAppointment: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBookAppointment }) => {
  return (
    <footer
      className="bg-[#0b3037] text-[#f7f4ec] pt-28 pb-20 px-4 sm:px-6 lg:px-8 border-t border-[#f7f4ec]/10 relative overflow-hidden"
      aria-label="SHREE Visual Footer"
    >
      {/* Background Golden Sunlight Aura */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#d9ae4a]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#6c9f36]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Top Tier: Huge Statement (Section 36) */}
        <div className="pb-16 border-b border-[#f7f4ec]/15">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2
                className="font-heading font-extrabold tracking-tight text-[#f7f4ec] mb-4"
                style={{
                  fontSize: 'clamp(3.8rem, 9vw, 9.5rem)',
                  lineHeight: 0.85,
                  letterSpacing: '-0.06em'
                }}
              >
                LET'S <br />
                MOVE <br />
                <span className="text-[#d9ae4a] font-editorial italic font-normal">forward.</span>
              </h2>

              {/* Gold dot / path line */}
              <div className="flex items-center gap-3 mt-4">
                <span className="w-3 h-3 rounded-full bg-[#d9ae4a]" />
                <div className="h-0.5 w-32 bg-[#d9ae4a]" />
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end items-start lg:items-end">
              <button
                onClick={onBookAppointment}
                className="px-8 py-4 rounded-full bg-[#d9ae4a] hover:bg-[#e4be60] text-[#0b3037] font-heading font-bold text-sm tracking-wide shadow-xl active:scale-98 transition-all"
              >
                Request Care Consultation →
              </button>
            </div>
          </div>
        </div>

        {/* Middle Tier: Logo, Links & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-16 border-b border-[#f7f4ec]/15">
          {/* Logo & Brand Essence */}
          <div className="md:col-span-4">
            <ShreeLogo variant="full" theme="light" className="mb-6" />
            <p className="text-sm text-[#f7f4ec]/75 font-body leading-relaxed max-w-sm">
              SHREE is an integrated multidisciplinary healthcare center uniting audiology, speech-language therapy, and physical rehabilitation under one patient-centered roof.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f7f4ec] mb-4">
              PRACTICE AREAS
            </h3>
            <ul className="space-y-2 text-xs font-body text-[#f7f4ec]/70">
              <li><a href="#section-audiology" className="hover:text-[#d9ae4a] transition-colors">Audiology & Diagnostics</a></li>
              <li><a href="#section-speech-therapy" className="hover:text-[#d9ae4a] transition-colors">Speech & Language Therapy</a></li>
              <li><a href="#section-physiotherapy" className="hover:text-[#d9ae4a] transition-colors">Physiotherapy & Mobility</a></li>
              <li><a href="#section-speech-therapy" className="hover:text-[#d9ae4a] transition-colors">Swallowing & VitalStim Care</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f7f4ec] mb-4">
              EXPERIENCE
            </h3>
            <ul className="space-y-2 text-xs font-body text-[#f7f4ec]/70">
              <li><a href="#services" className="hover:text-[#d9ae4a] transition-colors">Services</a></li>
              <li><a href="#approach" className="hover:text-[#d9ae4a] transition-colors">Patient Journey</a></li>
              <li><a href="#about" className="hover:text-[#d9ae4a] transition-colors">Philosophy</a></li>
              <li><a href="#specialists" className="hover:text-[#d9ae4a] transition-colors">Specialists</a></li>
              <li><a href="#resources" className="hover:text-[#d9ae4a] transition-colors">Clinical Journal</a></li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#f7f4ec] mb-4">
              CARE DESK
            </h3>
            <p className="text-xs font-body text-[#f7f4ec]/70 mb-2">{clinicData.contact.phone}</p>
            <p className="text-xs font-body text-[#d9ae4a] mb-2">{clinicData.contact.whatsapp}</p>
            <p className="text-xs font-body text-[#f7f4ec]/70 mb-4">{clinicData.contact.email}</p>
            <p className="text-[11px] font-body text-[#f7f4ec]/50 leading-relaxed">{clinicData.contact.hours}</p>
          </div>
        </div>

        {/* Bottom Tier: Medical Disclaimer & Legal */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-body text-[#f7f4ec]/50">
          <p className="max-w-xl text-center md:text-left leading-relaxed">
            <strong className="text-[#f7f4ec]/75">Medical Disclaimer:</strong> Information presented is intended for educational and appointment inquiry purposes. Consult our registered clinicians directly for comprehensive physical, auditory, or speech diagnosis.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <span>© {new Date().getFullYear()} SHREE Healthcare. All rights reserved.</span>
            <a href="#" className="hover:text-[#f7f4ec] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#f7f4ec] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
