import React, { useState, useEffect } from 'react';

interface HeroProps {
  onStartJourney: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney, onExploreServices }) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
    }

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTouch]);

  // Section 16: Hero scroll transformations
  const scrollProgress = Math.min(1, scrollY / 600);
  const heroImageScale = 1.05 - scrollProgress * 0.05; // 1.05 -> 1.0
  const headingTranslateY = scrollProgress * -80; // 0 -> -80px
  const headingOpacity = Math.max(0, 1 - scrollProgress * 1.4); // 1 -> 0

  // Section 15: Mouse movement spring offsets (desktop only)
  const imageOffsetX = isTouch ? 0 : mousePos.x * 6;
  const imageOffsetY = isTouch ? 0 : mousePos.y * 6;
  const cardOffsetX = isTouch ? 0 : mousePos.x * -10;
  const cardOffsetY = isTouch ? 0 : mousePos.y * -10;

  return (
    <section
      className="relative min-h-[100svh] pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden bg-[#f7f4ec]"
      aria-label="SHREE Hero Section"
    >
      {/* Background Soft Sunlight Gradient */}
      <div className="absolute top-0 right-0 w-[600px] lg:w-[900px] h-[600px] lg:h-[900px] pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-full h-full rounded-full bg-gradient-to-br from-[#d9ae4a]/15 via-[#6c9f36]/10 to-transparent blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto w-full my-auto py-6">
        {/* Desktop Layout: ~15% left margin/whitespace, 55-60% image, 25-30% floating content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Typography & Editorial Column (col-span-6) */}
          <div
            className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center transition-all duration-200"
            style={{
              transform: `translateY(${headingTranslateY}px)`,
              opacity: headingOpacity
            }}
          >
            {/* Small Label (Section 07: 11px uppercase tracking) */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#d9ae4a]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase font-body text-[#123f48]">
                Audiology · Speech · Physiotherapy
              </span>
            </div>

            {/* Oversized Responsive Heading (Section 07 & 13) */}
            <h1
              className="text-[#0b3037] font-heading font-extrabold tracking-tight mb-6"
              style={{
                fontSize: 'clamp(3.5rem, 7.5vw, 7.5rem)',
                lineHeight: 0.88,
                letterSpacing: '-0.06em'
              }}
            >
              <span className="block font-extrabold">Better hearing.</span>
              <span className="block font-semibold text-[#123f48]">Better communication.</span>
              <span className="block font-extrabold">Better movement.</span>
            </h1>

            {/* Emotional line with serif only on 'right care' (Section 06 & 13) */}
            <p className="text-lg sm:text-2xl text-[#12333a]/80 font-body leading-relaxed mb-8 max-w-lg">
              A more confident life begins with the{' '}
              <span className="font-editorial text-2xl sm:text-3xl text-[#0b3037] font-normal not-italic px-1">
                right care.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-8">
              <button
                onClick={onStartJourney}
                className="group px-8 py-4 bg-[#0b3037] hover:bg-[#123f48] text-[#f7f4ec] text-sm sm:text-base font-bold font-heading rounded-full shadow-lg shadow-[#0b3037]/20 active:scale-[0.98] transition-all flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
              >
                <span>Start Your Journey</span>
                <span className="text-[#d9ae4a] transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <button
                onClick={onExploreServices}
                className="px-7 py-4 bg-[#f7f4ec] hover:bg-[#eee9dc] text-[#0b3037] text-sm sm:text-base font-semibold font-heading rounded-full border border-[#123f48]/15 transition-all focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
              >
                Explore Services
              </button>
            </div>
          </div>

          {/* Cinematic Hero Visual & Floating Overlays (col-span-6 or 7) */}
          <div className="lg:col-span-6 xl:col-span-7 relative">
            <div
              className="relative rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(11,48,55,0.12)] border border-[#123f48]/10 aspect-[4/3] sm:aspect-[16/11] bg-[#0b3037]"
              style={{
                transform: `scale(${heroImageScale}) translate3d(${imageOffsetX}px, ${imageOffsetY}px, 0)`,
                transition: 'transform 0.15s ease-out'
              }}
            >
              {/* Cinematic Art Canvas */}
              <svg
                className="w-full h-full object-cover"
                viewBox="0 0 1000 700"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#123f48" />
                    <stop offset="50%" stopColor="#0b3037" />
                    <stop offset="100%" stopColor="#072227" />
                  </linearGradient>
                  <radialGradient id="sunGlowHero" cx="70%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="#f5d77f" stopOpacity="0.7" />
                    <stop offset="40%" stopColor="#d9ae4a" stopOpacity="0.3" />
                    <stop offset="85%" stopColor="#0b3037" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect width="1000" height="700" fill="url(#heroGradient)" />
                <rect x="350" y="0" width="650" height="700" fill="url(#sunGlowHero)" />

                {/* Studio Architectural Window & Light Lines */}
                <line x1="200" y1="0" x2="200" y2="700" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />
                <line x1="500" y1="0" x2="500" y2="700" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />
                <line x1="780" y1="0" x2="780" y2="700" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />

                {/* Oak timber panel ribs */}
                <rect x="80" y="340" width="160" height="240" rx="16" fill="#b6892e" fillOpacity="0.25" />
                <line x1="120" y1="340" x2="120" y2="580" stroke="#f7f4ec" strokeOpacity="0.1" strokeWidth="2" />
                <line x1="160" y1="340" x2="160" y2="580" stroke="#f7f4ec" strokeOpacity="0.1" strokeWidth="2" />

                {/* Gentle Leaf Silhouette (Tree concept) */}
                <path d="M860 360C820 280 730 300 700 400C770 440 820 400 860 360Z" fill="#6c9f36" fillOpacity="0.5" />
                <path d="M920 440C880 370 800 400 780 490C850 520 900 480 920 440Z" fill="#2e683b" fillOpacity="0.4" />

                {/* Clinician & Patient Silhouette */}
                <circle cx="560" cy="320" r="34" fill="#f7f4ec" fillOpacity="0.95" />
                <path d="M510 450C510 370 610 370 610 450V560H510V450Z" fill="#123f48" />
                <path d="M560 380L630 420" stroke="#f7f4ec" strokeWidth="8" strokeLinecap="round" />

                {/* Patient Guided with Care */}
                <circle cx="670" cy="360" r="26" fill="#f7f4ec" fillOpacity="0.95" />
                <path d="M635 480C635 420 705 420 705 480V560H635V480Z" fill="#d9ae4a" />

                {/* Signature Winding Path Line */}
                <path
                  d="M80 660C320 590 500 630 820 520"
                  stroke="#d9ae4a"
                  strokeWidth="3.5"
                  strokeOpacity="0.75"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b3037]/85 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Caption inside visual */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[#f7f4ec] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d9ae4a] animate-pulse" />
                  <span className="font-heading font-medium tracking-wide">Integrated Clinical Multidisciplinary Center</span>
                </div>
                <span className="font-editorial text-sm italic text-[#f7f4ec]/90">
                  Every journey begins with care.
                </span>
              </div>
            </div>

            {/* Section 14: Floating Hero Cards */}
            {/* Card 1: CHILD & ADULT CARE */}
            <div
              className="absolute -top-5 -left-4 sm:-left-6 p-4 rounded-[20px] bg-[#f7f4ec]/90 backdrop-blur-[18px] border border-[#123f48]/10 shadow-[0_12px_36px_rgba(11,48,55,0.08)] hidden sm:flex items-center gap-3 transition-transform duration-150"
              style={{
                transform: `translate3d(${cardOffsetX}px, ${cardOffsetY}px, 0)`
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#6c9f36]/20 text-[#6c9f36] flex items-center justify-center font-bold text-xs font-mono">
                01
              </div>
              <div>
                <p className="text-xs font-bold font-heading text-[#0b3037] uppercase tracking-wider">
                  CHILD & ADULT CARE
                </p>
                <p className="text-[11px] font-body text-[#12333a]/70">
                  Personalised support
                </p>
              </div>
            </div>

            {/* Card 2: HEARING · SPEECH · MOVEMENT */}
            <div
              className="absolute -bottom-5 left-8 sm:left-14 p-4 rounded-[20px] bg-[#f7f4ec]/90 backdrop-blur-[18px] border border-[#123f48]/10 shadow-[0_12px_36px_rgba(11,48,55,0.08)] hidden sm:flex items-center gap-3 transition-transform duration-150"
              style={{
                transform: `translate3d(${cardOffsetX * -0.8}px, ${cardOffsetY * -0.8}px, 0)`
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#d9ae4a]" />
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#0b3037] tracking-wider uppercase">
                <span>HEARING</span>
                <span className="text-[#6c9f36]">·</span>
                <span>SPEECH</span>
                <span className="text-[#6c9f36]">·</span>
                <span>MOVEMENT</span>
              </div>
            </div>

            {/* Card 3: START YOUR JOURNEY → */}
            <div
              onClick={onStartJourney}
              className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 p-4 rounded-[20px] bg-[#f7f4ec]/95 backdrop-blur-[18px] border border-[#123f48]/15 shadow-[0_12px_36px_rgba(11,48,55,0.12)] hidden md:flex items-center gap-3 cursor-pointer hover:bg-[#f7f4ec] transition-all duration-150 active:scale-95"
              style={{
                transform: `translate3d(${cardOffsetX * 1.2}px, calc(-50% + ${cardOffsetY * 1.2}px), 0)`
              }}
            >
              <span className="text-xs font-heading font-bold tracking-wider text-[#0b3037]">
                START YOUR JOURNEY
              </span>
              <span className="text-sm font-bold text-[#d9ae4a]">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
