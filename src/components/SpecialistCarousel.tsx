import React, { useState } from 'react';
import { specialistsData } from '../data/specialists';

interface SpecialistCarouselProps {
  onBookWithSpecialist: (specialistName: string) => void;
}

export const SpecialistCarousel: React.FC<SpecialistCarouselProps> = ({
  onBookWithSpecialist
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const specialist = specialistsData[currentIndex];

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < specialistsData.length - 1 ? prev + 1 : 0));
      setAnimating(false);
    }, 250);
  };

  const handlePrev = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : specialistsData.length - 1));
      setAnimating(false);
    }, 250);
  };

  return (
    <section
      id="specialists"
      className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto"
      aria-label="Clinical Specialists Carousel"
    >
      {/* Header with Navigation Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b border-[#123f48]/15">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d9ae4a]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase font-body text-[#6c9f36]">
              Clinical Multidisciplinary Faculty
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
            Our Clinical <br />
            <span className="text-[#123f48] font-editorial italic font-normal">specialists.</span>
          </h2>
        </div>

        {/* Counter and Navigation Controls */}
        <div className="flex items-center gap-6">
          <span className="text-sm font-mono font-bold text-[#12333a]/60 tracking-widest">
            {String(currentIndex + 1).padStart(2, '0')} / {String(specialistsData.length).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-[#123f48]/25 flex items-center justify-center hover:bg-[#0b3037] hover:text-[#f7f4ec] transition-all text-base focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
              aria-label="Previous specialist"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-[#123f48]/25 flex items-center justify-center hover:bg-[#0b3037] hover:text-[#f7f4ec] transition-all text-base focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
              aria-label="Next specialist"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Horizontal Showcase (Section 29) */}
      <div className="bg-[#f7f4ec] rounded-[32px] border border-[#123f48]/15 p-6 sm:p-12 shadow-[0_16px_44px_rgba(11,48,55,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Portrait with clip-path + opacity + scale transitions */}
          <div className="lg:col-span-5 relative">
            <div
              className={`relative rounded-[28px] overflow-hidden aspect-[4/5] bg-[#0b3037] shadow-inner flex items-center justify-center transition-all duration-500 ${
                animating
                  ? 'opacity-40 scale-95 [clip-path:inset(10%)]'
                  : 'opacity-100 scale-100 [clip-path:inset(0%)]'
              }`}
            >
              <svg
                className="w-full h-full object-cover"
                viewBox="0 0 500 625"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="specialistBg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#123f48" />
                    <stop offset="100%" stopColor="#0b3037" />
                  </linearGradient>
                  <radialGradient id="sunHalo2" cx="50%" cy="35%" r="40%">
                    <stop offset="0%" stopColor="#d9ae4a" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0b3037" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="500" height="625" fill="url(#specialistBg2)" />
                <circle cx="250" cy="220" r="180" fill="url(#sunHalo2)" />

                {/* Clinician Silhouette */}
                <circle cx="250" cy="230" r="85" fill="#f7f4ec" fillOpacity="0.9" />
                <path d="M120 480C120 380 200 360 250 360C300 360 380 380 380 480V625H120V480Z" fill="#123f48" />
                <path d="M210 360L250 430L290 360" stroke="#d9ae4a" strokeWidth="3.5" />
                <circle cx="250" cy="450" r="8" fill="#d9ae4a" />
              </svg>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0b3037]/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-[#f7f4ec]">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d9ae4a] block mb-1">
                  DEPARTMENT
                </span>
                <span className="text-xl font-heading font-extrabold">
                  {specialist.department}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Exact Layout Required by Section 29 */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* 01 / 05 Counter */}
              <span className="text-xs font-mono font-bold text-[#d9ae4a] uppercase tracking-widest block mb-2">
                {String(currentIndex + 1).padStart(2, '0')} / {String(specialistsData.length).padStart(2, '0')}
              </span>

              {/* NAME */}
              <h3 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#0b3037] mb-2">
                {specialist.name}
              </h3>

              {/* Specialisation */}
              <p className="text-sm font-heading font-bold text-[#6c9f36] uppercase tracking-wider mb-4">
                {specialist.role}
              </p>

              {/* Qualification & Registration (Section 29) */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-body font-semibold text-[#12333a]/75 pb-6 border-b border-[#123f48]/15 mb-6">
                <span>{specialist.qualification}</span>
                <span className="text-[#d9ae4a]">·</span>
                <span>{specialist.registration}</span>
                <span className="text-[#d9ae4a]">·</span>
                <span>{specialist.availableDays}</span>
              </div>

              {/* Short biography */}
              <div className="mb-6">
                <span className="text-xs font-mono font-bold text-[#12333a]/50 uppercase tracking-wider block mb-1">
                  Clinical Focus:
                </span>
                <p className="text-sm font-semibold text-[#123f48] mb-4">
                  {specialist.focus}
                </p>
                <p className="text-sm sm:text-base text-[#12333a]/80 font-body leading-relaxed">
                  {specialist.bio}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#123f48]/15 flex items-center justify-between">
              <span className="text-xs text-[#12333a]/60 italic font-editorial">
                [ADD REAL INFORMATION — Official RCI registration verified upon booking]
              </span>
              <button
                onClick={() => onBookWithSpecialist(`${specialist.role} (${specialist.department})`)}
                className="px-6 py-2.5 rounded-full bg-[#0b3037] hover:bg-[#123f48] text-[#f7f4ec] font-heading font-bold text-xs shadow transition-all"
              >
                Schedule Consultation →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
