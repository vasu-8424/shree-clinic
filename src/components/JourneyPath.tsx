import React, { useState, useEffect, useRef } from 'react';

interface JourneyPathProps {
  onStartJourney?: () => void;
  variant?: 'full-section' | 'divider' | 'cta';
}

export const JourneyPath: React.FC<JourneyPathProps> = ({
  onStartJourney,
  variant = 'full-section'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the element the user has scrolled
      const start = windowHeight * 0.8;
      const end = -rect.height * 0.2;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (variant === 'divider') {
    return (
      <div ref={containerRef} className="py-8 flex justify-center overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 600 60" className="w-full max-w-xl h-12 opacity-40">
          <path
            d="M20 30 C 180 5, 320 55, 580 30"
            stroke="#123f48"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={400 - scrollProgress * 400}
            fill="none"
          />
          <circle cx="580" cy="30" r="4" fill="#d9ae4a" />
        </svg>
      </div>
    );
  }

  const milestones = [
    {
      num: '01',
      title: 'UNDERSTAND',
      desc: 'Active clinical listening to your unique symptoms, personal history, and lifestyle priorities.'
    },
    {
      num: '02',
      title: 'ASSESS',
      desc: 'High-precision diagnostic evaluations to measure exact baselines across hearing, voice, or movement.'
    },
    {
      num: '03',
      title: 'PLAN',
      desc: 'Co-designing a transparent, multidisciplinary clinical roadmap with achievable functional goals.'
    },
    {
      num: '04',
      title: 'TREAT',
      desc: 'Evidence-based one-on-one therapy sessions combining advanced modalities with compassionate guidance.'
    },
    {
      num: '05',
      title: 'PROGRESS',
      desc: 'Continuous objective re-evaluations, empowering you and your family for sustained lifelong health.'
    }
  ];

  // Determine active milestone based on scroll progress
  const activeMilestoneIndex = Math.min(
    milestones.length - 1,
    Math.floor(scrollProgress * milestones.length)
  );

  return (
    <section
      id="approach"
      ref={containerRef}
      className="py-24 sm:py-36 px-4 sm:px-6 lg:px-8 bg-[#0b3037] text-[#f7f4ec] relative overflow-hidden"
      aria-label="Patient Journey"
    >
      {/* Background golden light & organic leaf glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#d9ae4a]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#6c9f36]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Oversized Typography */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#d9ae4a]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#d9ae4a]">
              The SHREE Clinical Pathway
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight font-heading leading-[0.88] text-[#f7f4ec] mb-6">
            YOUR <br />
            JOURNEY <br />
            <span className="text-[#d9ae4a] font-editorial italic font-normal">starts here.</span>
          </h2>

          <p className="text-base sm:text-xl text-[#f7f4ec]/80 leading-relaxed font-body font-light">
            Every recovery is an individual journey. Like the path in the SHREE emblem traveling toward the morning sun, we guide each patient with precision, empathy, and continuous clinical progress.
          </p>
        </div>

        {/* Dynamic SVG Path Running Across Page */}
        <div className="relative mb-16 hidden lg:block">
          <svg
            viewBox="0 0 1100 160"
            className="w-full h-36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background trace line */}
            <path
              d="M40 90 C 220 10, 360 160, 560 70 C 760 -10, 880 150, 1060 80"
              stroke="#123f48"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Animated drawing path */}
            <path
              d="M40 90 C 220 10, 360 160, 560 70 C 760 -10, 880 150, 1060 80"
              stroke="#d9ae4a"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="1200"
              strokeDashoffset={Math.max(0, 1200 - scrollProgress * 1200)}
              style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
            />
            {/* Destination golden sun point */}
            <circle cx="1060" cy="80" r="10" fill="#d9ae4a" className="animate-pulse" />
            <circle cx="1060" cy="80" r="5" fill="#f7f4ec" />
          </svg>
        </div>

        {/* 5 Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-6">
          {milestones.map((m, idx) => {
            const isActive = idx <= activeMilestoneIndex;
            const isCurrent = idx === activeMilestoneIndex;

            return (
              <div
                key={m.num}
                className={`p-6 sm:p-7 rounded-[24px] border transition-all duration-500 relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#f7f4ec] text-[#0b3037] border-[#d9ae4a] shadow-[0_16px_36px_rgba(217,174,74,0.15)] scale-[1.03]'
                    : isActive
                    ? 'bg-[#123f48]/70 text-[#f7f4ec] border-[#6c9f36]/40'
                    : 'bg-[#0b3037]/80 text-[#f7f4ec]/60 border-[#f7f4ec]/10'
                }`}
              >
                {/* Milestone Node Badge */}
                <div className="flex items-center justify-between mb-8">
                  <span
                    className={`text-xs font-mono font-bold tracking-widest ${
                      isCurrent ? 'text-[#d9ae4a]' : 'text-[#f7f4ec]/50'
                    }`}
                  >
                    PHASE {m.num}
                  </span>

                  {/* Active vs Inactive Dot */}
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isActive
                        ? 'border-[#d9ae4a] bg-[#d9ae4a]'
                        : 'border-[#123f48] bg-transparent'
                    }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0b3037]" />}
                  </div>
                </div>

                <div>
                  <h3
                    className={`text-xl sm:text-2xl font-extrabold tracking-tight font-heading mb-3 ${
                      isCurrent ? 'text-[#0b3037]' : 'text-[#f7f4ec]'
                    }`}
                  >
                    {m.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed font-body ${
                      isCurrent ? 'text-[#12333a]/85' : 'text-[#f7f4ec]/70'
                    }`}
                  >
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action within journey */}
        {onStartJourney && (
          <div className="mt-16 text-center">
            <button
              onClick={onStartJourney}
              className="px-8 py-4 rounded-full bg-[#d9ae4a] hover:bg-[#e4be60] text-[#0b3037] font-heading font-bold text-sm tracking-wide shadow-lg active:scale-[0.98] transition-all"
            >
              Start Your Personalized Clinical Journey →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
