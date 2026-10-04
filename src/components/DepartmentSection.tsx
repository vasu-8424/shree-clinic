import React, { useState } from 'react';
import { DepartmentService } from '../data/services';

interface DepartmentSectionProps {
  service: DepartmentService;
  onBookService: (serviceName: string) => void;
}

export const DepartmentSection: React.FC<DepartmentSectionProps> = ({
  service,
  onBookService
}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(
    service.subServices[0]?.id || null
  );

  const isAudiology = service.id === 'audiology';
  const isSpeech = service.id === 'speech-therapy';
  const isPhysio = service.id === 'physiotherapy';

  // Section 21, 22, 23 Background Colors
  const sectionBgClass = isAudiology
    ? 'bg-[#0b3037] text-[#f7f4ec]'
    : isSpeech
    ? 'bg-[#f7f4ec] text-[#12333a]'
    : isPhysio
    ? 'bg-[#dfe9cf] text-[#12333a]'
    : 'bg-[#eee9dc] text-[#12333a]';

  const headingColor = isAudiology ? 'text-[#f7f4ec]' : 'text-[#0b3037]';
  const labelColor = isAudiology ? 'text-[#d9ae4a]' : 'text-[#6c9f36]';
  const borderColor = isAudiology ? 'border-[#f7f4ec]/15' : 'border-[#123f48]/15';

  return (
    <section
      id={`section-${service.id}`}
      className={`py-28 sm:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500 ${sectionBgClass}`}
      aria-label={`${service.category} Department`}
    >
      {/* Background Subtle Organic Lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#d9ae4a]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Header Block with Oversized Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 sm:mb-20 items-end">
          <div className="lg:col-span-7">
            {/* Small Label (Section 07: 11px uppercase tracking) */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#d9ae4a]" />
              <span className={`text-[11px] font-bold tracking-[0.18em] uppercase font-body ${labelColor}`}>
                {service.number} / {service.category.toUpperCase()}
              </span>
            </div>

            {/* Oversized Responsive Heading with Editorial Serif on key accents */}
            <h2
              className={`font-heading font-extrabold tracking-tight ${headingColor} mb-6`}
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 8rem)',
                lineHeight: 0.86,
                letterSpacing: '-0.055em'
              }}
            >
              {isAudiology && (
                <>
                  HEAR <br />
                  <span className="text-[#f7f4ec]">BETTER.</span>
                </>
              )}
              {isSpeech && (
                <>
                  FIND YOUR <br />
                  <span className="font-editorial italic font-normal text-[#0b3037]">voice.</span>
                </>
              )}
              {isPhysio && (
                <>
                  MOVE <br />
                  <span className="font-editorial italic font-normal text-[#0b3037]">forward.</span>
                </>
              )}
              {!isAudiology && !isSpeech && !isPhysio && service.headline}
            </h2>

            {/* Gold Accent Line */}
            <div className="w-24 h-1 bg-[#d9ae4a] rounded-full mb-6" />

            <p className="text-base sm:text-xl font-body leading-relaxed max-w-xl opacity-85">
              {service.subheadline}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-end items-start lg:items-end">
            <button
              onClick={() => onBookService(service.category)}
              className={`px-8 py-3.5 rounded-full font-heading font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all active:scale-98 ${
                isAudiology
                  ? 'bg-[#d9ae4a] text-[#0b3037] hover:bg-[#e4be60]'
                  : 'bg-[#0b3037] text-[#f7f4ec] hover:bg-[#123f48]'
              }`}
            >
              Consult {service.category} Specialist →
            </button>
          </div>
        </div>

        {/* Central Feature Layout: Visual Panel + Interactive List (Section 21, 22, 23) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Architectural Photograph Panel (Right on Audiology / Left on Speech) */}
          <div className={`lg:col-span-5 ${isSpeech ? 'lg:order-2' : 'lg:order-1'}`}>
            <div
              className={`relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(11,48,55,0.14)] border ${borderColor} aspect-[4/5] bg-[#0b3037] group`}
            >
              <svg
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                viewBox="0 0 600 750"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id={`deptGrad-${service.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#123f48" />
                    <stop offset="50%" stopColor="#0b3037" />
                    <stop offset="100%" stopColor="#072227" />
                  </linearGradient>
                  <radialGradient id={`deptGlow-${service.id}`} cx="70%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#d9ae4a" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#0b3037" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect width="600" height="750" fill={`url(#deptGrad-${service.id})`} />
                <circle cx="480" cy="220" r="280" fill={`url(#deptGlow-${service.id})`} />

                {/* Specific Department Motifs */}
                {isAudiology && (
                  <>
                    <circle cx="300" cy="380" r="240" stroke="#d9ae4a" strokeWidth="1" strokeOpacity="0.25" />
                    <circle cx="300" cy="380" r="170" stroke="#d9ae4a" strokeWidth="1.2" strokeOpacity="0.35" strokeDasharray="4 4" />
                    <circle cx="300" cy="380" r="110" stroke="#f7f4ec" strokeWidth="1.5" strokeOpacity="0.4" />
                    <circle cx="300" cy="380" r="42" fill="#d9ae4a" fillOpacity="0.8" />
                    <path d="M50 520C150 490 220 430 300 450C380 470 440 380 550 360" stroke="#f7f4ec" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
                  </>
                )}

                {isSpeech && (
                  <>
                    <path d="M120 400C120 280 220 240 280 240C360 240 440 300 460 380C480 460 400 560 320 560C240 560 160 520 120 400Z" fill="#6c9f36" fillOpacity="0.4" />
                    <path d="M280 280C340 320 360 380 340 440" stroke="#d9ae4a" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M320 260C400 310 420 400 390 480" stroke="#f7f4ec" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" strokeDasharray="4 4" />
                  </>
                )}

                {isPhysio && (
                  <>
                    <line x1="80" y1="620" x2="520" y2="180" stroke="#d9ae4a" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="6 4" />
                    <circle cx="200" cy="500" r="18" fill="#f7f4ec" />
                    <circle cx="330" cy="370" r="24" fill="#d9ae4a" />
                    <circle cx="440" cy="260" r="16" fill="#f7f4ec" />
                    <path d="M200 500L330 370L440 260" stroke="#f7f4ec" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M100 640C260 570 380 630 520 550" stroke="#6c9f36" strokeWidth="3.5" strokeLinecap="round" />
                  </>
                )}

                {/* Subtle Winding Path across the bottom of the card */}
                <path d="M60 700C220 640 360 670 540 600" stroke="#f7f4ec" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 4" />
              </svg>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0b3037]/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-8 left-8 right-8 text-[#f7f4ec]">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d9ae4a] block mb-1">
                  CLINICAL PROTOCOL
                </span>
                <p className="font-editorial text-2xl text-[#f7f4ec] leading-snug mb-2">
                  "{service.summary}"
                </p>
                <span className="text-xs text-[#dfe9cf] uppercase tracking-wider font-semibold font-body">
                  Certified Clinical Standard
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Horizontal Service List: Height 70-90px desktop with border-bottom (Section 21) */}
          <div className={`lg:col-span-7 flex flex-col ${isSpeech ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className={`pb-3 mb-2 flex items-center justify-between text-xs font-mono tracking-wider uppercase border-b ${borderColor} opacity-60`}>
              <span>PROCEDURE</span>
              <span>CLINICAL DETAIL</span>
            </div>

            {service.subServices.map((sub, index) => {
              const isExpanded = expandedItemId === sub.id;
              const isHovered = hoveredItemId === sub.id;

              return (
                <div
                  key={sub.id}
                  onMouseEnter={() => setHoveredItemId(sub.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  className={`border-b transition-all duration-300 overflow-hidden ${borderColor} ${
                    isHovered
                      ? isAudiology
                        ? 'bg-[#123f48]/70 pl-3'
                        : 'bg-[#dfe9cf]/50 pl-3'
                      : ''
                  }`}
                >
                  <button
                    onClick={() => setExpandedItemId(isExpanded ? null : sub.id)}
                    className="w-full min-h-[75px] py-4 text-left flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold opacity-50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-base sm:text-xl font-bold font-heading">
                          {sub.name}
                        </h4>
                        {sub.indication && (
                          <span className="text-xs text-[#6c9f36] font-medium block mt-0.5">
                            {sub.indication}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isExpanded
                            ? 'bg-[#d9ae4a] text-[#0b3037] rotate-90'
                            : isAudiology
                            ? 'bg-[#f7f4ec]/10 text-[#f7f4ec]'
                            : 'bg-[#0b3037]/10 text-[#0b3037]'
                        }`}
                      >
                        <span className="text-sm font-bold">→</span>
                      </div>
                    </div>
                  </button>

                  {/* Description slides in when expanded */}
                  {isExpanded && (
                    <div className="pb-6 pt-1 text-sm font-body leading-relaxed max-w-2xl opacity-90">
                      <p className="mb-4">{sub.description}</p>
                      <button
                        onClick={() => onBookService(`${service.category} — ${sub.name}`)}
                        className={`px-4 py-2 rounded-full text-xs font-bold font-heading transition-colors ${
                          isAudiology
                            ? 'bg-[#f7f4ec] text-[#0b3037] hover:bg-[#eee9dc]'
                            : 'bg-[#0b3037] text-[#f7f4ec] hover:bg-[#123f48]'
                        }`}
                      >
                        Schedule This Procedure →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
