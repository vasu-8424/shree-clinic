import React from 'react';
import { clinicData } from '../data/clinic';

interface ContactSectionProps {
  onBookAppointment: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onBookAppointment }) => {
  return (
    <section id="contact" className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto" aria-label="Clinic Contact & Map">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Heading & Contact Actions (Section 34) */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#6c9f36]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase font-body text-[#6c9f36]">
              Reception & Facilities
            </span>
          </div>

          <h2
            className="text-[#0b3037] font-heading font-extrabold tracking-tight mb-8"
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
              lineHeight: 0.86,
              letterSpacing: '-0.055em'
            }}
          >
            COME <br />
            SEE <br />
            <span className="text-[#123f48] font-editorial italic font-normal">us.</span>
          </h2>

          <div className="space-y-6 text-sm text-[#12333a]/85 font-body">
            <div>
              <span className="text-xs font-mono font-bold text-[#12333a]/40 uppercase tracking-wider block mb-1">
                LOCATION
              </span>
              <p className="font-heading font-bold text-base text-[#0b3037]">
                {clinicData.contact.address}
              </p>
              <p className="text-xs text-[#12333a]/60 mt-0.5">
                Wheelchair accessibility & patient drop-off bay available.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#123f48]/15">
              <div>
                <span className="text-xs font-mono font-bold text-[#12333a]/40 uppercase tracking-wider block mb-1">
                  CARE DESK
                </span>
                <p className="font-heading font-bold text-[#0b3037]">{clinicData.contact.phone}</p>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#12333a]/40 uppercase tracking-wider block mb-1">
                  WHATSAPP DIRECT
                </span>
                <p className="font-heading font-bold text-[#6c9f36]">{clinicData.contact.whatsapp}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#123f48]/15">
              <span className="text-xs font-mono font-bold text-[#12333a]/40 uppercase tracking-wider block mb-1">
                CLINICAL INQUIRIES
              </span>
              <p className="font-heading font-bold text-[#0b3037]">{clinicData.contact.email}</p>
            </div>

            <div className="pt-4 border-t border-[#123f48]/15">
              <span className="text-xs font-mono font-bold text-[#12333a]/40 uppercase tracking-wider block mb-1">
                HOURS
              </span>
              <p className="font-body text-xs font-semibold text-[#0b3037]">{clinicData.contact.hours}</p>
            </div>
          </div>

          {/* Section 34 Required Actions: CALL, WHATSAPP, GET DIRECTIONS, BOOK APPOINTMENT */}
          <div className="mt-10 pt-6 border-t border-[#123f48]/15 grid grid-cols-2 gap-3">
            <a
              href={`tel:${clinicData.contact.phone.replace(/[^0-9+]/g, '')}`}
              className="py-3.5 px-4 rounded-full border border-[#123f48]/20 text-center font-heading font-bold text-xs uppercase tracking-wider text-[#0b3037] hover:bg-[#0b3037] hover:text-[#f7f4ec] transition-colors"
            >
              CALL
            </a>
            <a
              href="https://wa.me/"
              className="py-3.5 px-4 rounded-full bg-[#6c9f36]/15 hover:bg-[#6c9f36]/25 text-center font-heading font-bold text-xs uppercase tracking-wider text-[#6c9f36] transition-colors"
            >
              WHATSAPP
            </a>
            <a
              href="#booking"
              className="py-3.5 px-4 rounded-full border border-[#123f48]/20 text-center font-heading font-bold text-xs uppercase tracking-wider text-[#0b3037] hover:bg-[#0b3037] hover:text-[#f7f4ec] transition-colors"
            >
              GET DIRECTIONS
            </a>
            <button
              onClick={onBookAppointment}
              className="py-3.5 px-4 rounded-full bg-[#0b3037] hover:bg-[#123f48] text-[#f7f4ec] text-center font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              BOOK
            </button>
          </div>
        </div>

        {/* Right Column: Large Architectural Map (Section 34) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-[32px] overflow-hidden border border-[#123f48]/15 shadow-[0_16px_40px_rgba(11,48,55,0.08)] aspect-[16/11] bg-[#eee9dc]">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 800 550"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="800" height="550" fill="#eee9dc" />
              {/* Grid Avenues */}
              <path d="M0 90L800 90M0 210L800 210M0 350L800 350M0 470L800 470" stroke="#123f48" strokeOpacity="0.05" strokeWidth="2" />
              <path d="M140 0L140 550M340 0L340 550M560 0L560 550M720 0L720 550" stroke="#123f48" strokeOpacity="0.05" strokeWidth="2" />

              {/* Park and green belt ribbon */}
              <path
                d="M-50 430 C180 390, 260 490, 480 400 C650 330, 720 350, 850 270"
                stroke="#dfe9cf"
                strokeWidth="50"
                strokeLinecap="round"
                fill="none"
              />

              {/* Roads */}
              <path d="M0 250 L800 310" stroke="#f7f4ec" strokeWidth="18" />
              <path d="M430 0 L390 550" stroke="#f7f4ec" strokeWidth="22" />

              {/* Golden Clinic Pin */}
              <circle cx="410" cy="280" r="42" fill="#d9ae4a" fillOpacity="0.2" className="animate-ping" />
              <circle cx="410" cy="280" r="28" fill="#f7f4ec" filter="drop-shadow(0 4px 12px rgba(11,48,55,0.18))" />
              <circle cx="410" cy="280" r="14" fill="#0b3037" />
              <circle cx="410" cy="280" r="6" fill="#d9ae4a" />

              {/* Map Tag */}
              <g transform="translate(330, 160)">
                <rect width="160" height="60" rx="14" fill="#0b3037" />
                <text x="80" y="26" textAnchor="middle" fill="#d9ae4a" fontSize="11" fontFamily="'Sora', sans-serif" fontWeight="bold" letterSpacing="2">
                  SHREE CLINIC
                </text>
                <text x="80" y="44" textAnchor="middle" fill="#f7f4ec" fontSize="10" fontFamily="'Inter', sans-serif">
                  Multidisciplinary Center
                </text>
              </g>
            </svg>

            {/* Bottom Floating Bar */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#f7f4ec]/95 backdrop-blur-md border border-[#123f48]/15 flex items-center justify-between">
              <div>
                <span className="text-xs font-heading font-bold text-[#0b3037] block">Accessible Location</span>
                <span className="text-[11px] font-body text-[#12333a]/60">Connected by metro & arterial roads</span>
              </div>
              <a
                href="#booking"
                className="px-5 py-2.5 rounded-full bg-[#0b3037] text-[#f7f4ec] font-heading font-bold text-xs hover:bg-[#123f48] transition-colors"
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
