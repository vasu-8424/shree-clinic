import React, { useState } from 'react';

export const AboutSection: React.FC = () => {
  const [activePhilosophy, setActivePhilosophy] = useState<number>(0);

  const philosophies = [
    {
      word: 'LISTEN.',
      title: 'Active Clinical Presence',
      body: 'Healing starts before diagnostics. We listen with unhurried attention to the daily frustrations, silent fears, and personal ambitions that define your condition.'
    },
    {
      word: 'UNDERSTAND.',
      title: 'Deep Objective Mapping',
      body: 'We map the precise mechanical, neurological, and acoustic roots of your symptoms to construct a transparent and realistic treatment roadmap.'
    },
    {
      word: 'SUPPORT.',
      title: 'Unwavering Partnership',
      body: 'Therapy extends beyond the clinic doors. We stand alongside patients and families at every step, celebrating functional milestones and empowering lifelong vitality.'
    }
  ];

  return (
    <section id="about" className="py-28 sm:py-40 bg-[#eee9dc]/50 border-t border-[#123f48]/15 relative overflow-hidden" aria-label="About SHREE & Philosophy">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-[#d9ae4a]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 27: Huge Editorial Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 items-start">
          <div className="lg:col-span-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase font-body text-[#6c9f36] block sticky top-36">
              ABOUT SHREE
            </span>
          </div>

          <div className="lg:col-span-9">
            <h2
              className="text-[#0b3037] font-heading font-extrabold tracking-tight mb-8"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 8rem)',
                lineHeight: 0.86,
                letterSpacing: '-0.055em'
              }}
            >
              Healthcare <br />
              should feel <br />
              <span className="text-[#123f48] font-editorial italic font-normal">human.</span>
            </h2>

            <p className="text-xl sm:text-2xl text-[#12333a]/85 font-body font-light leading-relaxed max-w-3xl mb-12">
              SHREE brings together specialised care across hearing, communication, movement and rehabilitation — with the patient at the centre of every journey.
            </p>
          </div>
        </div>

        {/* Section 28: PHILOSOPHY — Three Huge Words: LISTEN. UNDERSTAND. SUPPORT. */}
        <div className="mb-32">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d9ae4a]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase font-body text-[#123f48]">
              Foundational Tenets
            </span>
          </div>

          <div className="flex flex-col space-y-8">
            {philosophies.map((p, idx) => {
              const isActive = activePhilosophy === idx;

              return (
                <div
                  key={p.word}
                  onMouseEnter={() => setActivePhilosophy(idx)}
                  className={`p-8 sm:p-14 rounded-[32px] border transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'bg-[#0b3037] text-[#f7f4ec] border-[#0b3037] shadow-xl'
                      : 'bg-[#f7f4ec] text-[#0b3037] border-[#123f48]/10 hover:border-[#123f48]/25 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7">
                      <span className="text-xs font-mono font-bold tracking-widest text-[#d9ae4a] block mb-2">
                        0{idx + 1} / 03
                      </span>
                      <h3
                        className="font-heading font-extrabold tracking-tight leading-none"
                        style={{
                          fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
                          letterSpacing: '-0.04em'
                        }}
                      >
                        {p.word}
                      </h3>
                    </div>

                    <div className="lg:col-span-5">
                      <h4 className={`text-lg font-heading font-bold mb-2 ${isActive ? 'text-[#d9ae4a]' : 'text-[#6c9f36]'}`}>
                        {p.title}
                      </h4>
                      <p className={`text-sm sm:text-base font-body leading-relaxed ${isActive ? 'text-[#f7f4ec]/85' : 'text-[#12333a]/75'}`}>
                        {p.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 31: CARE EXPERIENCE SECTION */}
        <div className="rounded-[36px] p-8 sm:p-16 lg:p-20 bg-[#f7f4ec] border border-[#123f48]/15 text-center relative overflow-hidden shadow-[0_16px_40px_rgba(11,48,55,0.06)]">
          {/* Subtle Organic Plant Artwork in background */}
          <svg
            className="absolute -right-12 -bottom-12 w-80 h-80 opacity-10 pointer-events-none"
            viewBox="0 0 200 200"
            fill="none"
          >
            <path d="M10 190C60 120 140 100 190 20" stroke="#6c9f36" strokeWidth="4" />
            <circle cx="90" cy="110" r="18" fill="#6c9f36" />
            <circle cx="130" cy="70" r="22" fill="#2e683b" />
            <circle cx="160" cy="40" r="16" fill="#d9ae4a" />
          </svg>

          <span className="text-[11px] font-bold tracking-[0.2em] uppercase font-body text-[#6c9f36] block mb-4">
            A Sanctuary For Healing
          </span>

          <h3
            className="text-[#0b3037] font-body max-w-3xl mx-auto leading-tight mb-8"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              letterSpacing: '-0.03em'
            }}
          >
            Care feels different <br />
            when you feel{' '}
            <span className="font-editorial italic font-normal text-[#123f48] px-1">
              understood.
            </span>
          </h3>

          <p className="text-base sm:text-lg text-[#12333a]/80 font-body leading-relaxed max-w-xl mx-auto">
            A welcoming clinic designed to eliminate clinical coldness, combining peaceful acoustics, natural timber, and empathetic practitioners.
          </p>
        </div>
      </div>
    </section>
  );
};
