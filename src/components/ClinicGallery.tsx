import React, { useState } from 'react';

interface GalleryItem {
  id: string;
  category: string;
  title: string;
  description: string;
  spanClass: string;
  aspectClass: string;
  isTinyFloating?: boolean;
}

const items: GalleryItem[] = [
  {
    id: 'g-1',
    category: 'Diagnostic Suite',
    title: 'Sound-Treated Acoustic Audiometry Booth',
    description: 'Calibrated acoustic isolation for clinical pure tone testing and speech audiometry.',
    spanClass: 'col-span-12 lg:col-span-8',
    aspectClass: 'aspect-[16/10]'
  },
  {
    id: 'g-2',
    category: 'Pediatric Care',
    title: 'Language & Articulation Studio',
    description: 'Play-integrated motor and language exploration tables for infants and children.',
    spanClass: 'col-span-12 sm:col-span-6 lg:col-span-4',
    aspectClass: 'aspect-[4/3]'
  },
  {
    id: 'g-3',
    category: 'Rehabilitation',
    title: 'Neuro & Gait Training Parallel Course',
    description: 'Specialized support harness systems and kinetic floor for balance re-education.',
    spanClass: 'col-span-12 sm:col-span-6 lg:col-span-4',
    aspectClass: 'aspect-[3/4]'
  },
  {
    id: 'g-4',
    category: 'Consultation',
    title: 'Private Family Counseling Room',
    description: 'Unhurried discussions regarding treatment roadmaps and home empowerment routines.',
    spanClass: 'col-span-12 lg:col-span-8',
    aspectClass: 'aspect-[16/9]'
  },
  {
    id: 'g-5',
    category: 'Ambience',
    title: 'Acoustic Lobby & Reception',
    description: 'Natural oak paneling and calming botanical elements.',
    spanClass: 'col-span-6 sm:col-span-4 lg:col-span-3',
    aspectClass: 'aspect-square',
    isTinyFloating: true
  }
];

export const ClinicGallery: React.FC = () => {
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  return (
    <section className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto" aria-label="Cinematic Clinic Gallery">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b border-[#123f48]/15">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#6c9f36]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase font-body text-[#6c9f36]">
              Atmosphere & Technology
            </span>
          </div>
          <h2
            className="text-[#0b3037] font-heading font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.05em'
            }}
          >
            The Clinic <br />
            <span className="text-[#123f48] font-editorial italic font-normal">gallery.</span>
          </h2>
        </div>

        <p className="max-w-md text-base text-[#12333a]/80 font-body leading-relaxed">
          Architectural spaces tailored to eliminate clinical stress and heighten acoustic, speech, and physical rehabilitation outcomes.
        </p>
      </div>

      {/* Asymmetric Masonry Grid (Section 30: One very large, two medium, one vertical, one tiny floating) */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightboxItem(item)}
            className={`cursor-pointer group relative rounded-[28px] overflow-hidden border border-[#123f48]/15 shadow-[0_12px_36px_rgba(11,48,55,0.08)] bg-[#0b3037] ${item.spanClass} ${item.aspectClass}`}
          >
            {/* Visual Canvas with Hover Scale 1.04 */}
            <svg
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              viewBox="0 0 600 400"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`galGrad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#123f48" />
                  <stop offset="60%" stopColor="#0b3037" />
                  <stop offset="100%" stopColor="#072227" />
                </linearGradient>
                <radialGradient id={`glow-${item.id}`} cx="80%" cy="20%" r="50%">
                  <stop offset="0%" stopColor="#d9ae4a" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0b3037" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="600" height="400" fill={`url(#galGrad-${item.id})`} />
              <circle cx="500" cy="80" r="260" fill={`url(#glow-${item.id})`} />

              {/* Architectural Lines */}
              <line x1="100" y1="0" x2="100" y2="400" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />
              <line x1="280" y1="0" x2="280" y2="400" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />
              <path d="M0 290L600 240V400H0V290Z" fill="#072227" />
              <path d="M40 360C200 320 360 340 560 290" stroke="#d9ae4a" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 4" />
            </svg>

            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b3037]/90 via-[#0b3037]/30 to-transparent pointer-events-none" />

            {/* Overlaid Label & Content */}
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-[#f7f4ec]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-[#f7f4ec]/10 text-[#d9ae4a] backdrop-blur-sm">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-bold text-[#f7f4ec]/50 group-hover:text-[#d9ae4a] transition-colors">
                  EXPAND ↗
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-2xl font-heading font-extrabold text-[#f7f4ec] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#f7f4ec]/75 font-body line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Lightbox (Section 30) */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-[#0b3037]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f7f4ec] rounded-[32px] p-6 sm:p-10 max-w-4xl w-full border border-[#123f48]/15 shadow-2xl relative"
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#0b3037] text-[#f7f4ec] flex items-center justify-center font-bold text-sm"
              aria-label="Close Lightbox"
            >
              ✕
            </button>

            <span className="text-xs font-mono font-bold text-[#6c9f36] uppercase tracking-wider block mb-2">
              {lightboxItem.category}
            </span>

            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0b3037] mb-4">
              {lightboxItem.title}
            </h3>

            <div className="aspect-[16/9] rounded-[24px] overflow-hidden bg-[#0b3037] mb-6 flex items-center justify-center relative">
              <svg className="w-full h-full object-cover" viewBox="0 0 800 450" fill="none">
                <rect width="800" height="450" fill="#123f48" />
                <circle cx="400" cy="225" r="180" fill="#0b3037" />
                <circle cx="400" cy="225" r="60" fill="#d9ae4a" fillOpacity="0.4" />
                <text x="400" y="235" textAnchor="middle" fill="#f7f4ec" fontSize="16" fontFamily="sans-serif" fontWeight="bold">
                  SHREE CLINIC FACILITY
                </text>
              </svg>
            </div>

            <p className="text-base text-[#12333a]/85 font-body leading-relaxed mb-6">
              {lightboxItem.description}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setLightboxItem(null)}
                className="px-6 py-2.5 rounded-full bg-[#0b3037] text-[#f7f4ec] font-heading font-bold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
