import React, { useState } from 'react';
import { whoWeHelpData } from '../data/services';

interface PeopleSectionProps {
  onSelectGroup: (groupName: string) => void;
}

export const PeopleSection: React.FC<PeopleSectionProps> = ({ onSelectGroup }) => {
  const [activeGroupId, setActiveGroupId] = useState<string>('children');

  return (
    <section
      className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto"
      aria-label="Who We Help Asymmetric Collage"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b border-[#123f48]/15">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#6c9f36]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase font-body text-[#6c9f36]">
              Care Across Every Milestone
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
            Who We <br />
            <span className="text-[#123f48] font-editorial italic font-normal">care for.</span>
          </h2>
        </div>

        <p className="max-w-md text-base text-[#12333a]/80 font-body leading-relaxed">
          From a toddler's foundational words to an adult's post-surgical recovery or a senior's independent gait, our specialists adapt therapies to your chapter in life.
        </p>
      </div>

      {/* Asymmetric Image Collage (Section 26) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Label List */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {whoWeHelpData.map((group) => {
            const isActive = activeGroupId === group.id;

            return (
              <div
                key={group.id}
                onMouseEnter={() => setActiveGroupId(group.id)}
                onClick={() => setActiveGroupId(group.id)}
                className={`cursor-pointer p-6 rounded-[24px] border transition-all duration-300 ${
                  isActive
                    ? 'bg-[#0b3037] text-[#f7f4ec] border-[#0b3037] shadow-lg translate-x-2'
                    : 'bg-[#f7f4ec] text-[#0b3037] border-[#123f48]/10 hover:border-[#123f48]/25'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-heading font-extrabold tracking-tight transition-colors ${
                      isActive ? 'text-2xl text-[#f7f4ec]' : 'text-xl text-[#0b3037]'
                    }`}
                  >
                    {group.category.toUpperCase()}
                  </h3>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isActive ? 'text-[#d9ae4a]' : 'text-[#12333a]/40'
                    }`}
                  >
                    {isActive ? '● ACTIVE' : '○'}
                  </span>
                </div>

                <p
                  className={`text-xs font-body transition-colors mb-3 ${
                    isActive ? 'text-[#dfe9cf]' : 'text-[#6c9f36]'
                  }`}
                >
                  {group.subtitle}
                </p>

                <p
                  className={`text-xs leading-relaxed font-body ${
                    isActive ? 'text-[#f7f4ec]/85' : 'text-[#12333a]/70'
                  }`}
                >
                  {group.description}
                </p>

                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGroup(group.category);
                    }}
                    className="mt-4 text-xs font-heading font-bold text-[#d9ae4a] hover:underline flex items-center gap-1.5"
                  >
                    <span>Request {group.category} Consultation</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Asymmetric Visual Collage Canvas */}
        <div className="lg:col-span-8">
          <div className="relative rounded-[32px] overflow-hidden aspect-[16/11] bg-[#0b3037] shadow-[0_20px_50px_rgba(11,48,55,0.12)] border border-[#123f48]/15">
            {/* Collage Canvas */}
            <svg
              className="w-full h-full object-cover transition-all duration-700 ease-out"
              viewBox="0 0 900 620"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="collageSky" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#123f48" />
                  <stop offset="60%" stopColor="#0b3037" />
                  <stop offset="100%" stopColor="#072227" />
                </linearGradient>
                <radialGradient id="sunCollage" cx="70%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#d9ae4a" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#0b3037" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="900" height="620" fill="url(#collageSky)" />
              <circle cx="650" cy="180" r="260" fill="url(#sunCollage)" />

              {/* Architectural timber paneling */}
              <rect x="50" y="240" width="220" height="380" rx="20" fill="#b6892e" fillOpacity="0.2" />
              <line x1="120" y1="240" x2="120" y2="620" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />
              <line x1="190" y1="240" x2="190" y2="620" stroke="#f7f4ec" strokeOpacity="0.08" strokeWidth="2" />

              {/* Foliage Leaf Curves */}
              <path d="M780 320C740 240 650 260 620 360C690 400 740 360 780 320Z" fill="#6c9f36" fillOpacity="0.5" />
              <path d="M840 400C800 330 720 360 700 450C770 480 820 440 840 400Z" fill="#2e683b" fillOpacity="0.4" />

              {/* Central Human Group Silhouette */}
              <circle cx="480" cy="270" r="30" fill="#f7f4ec" />
              <path d="M435 390C435 320 525 320 525 390V520H435V390Z" fill="#123f48" />

              <circle cx="580" cy="310" r="24" fill="#f7f4ec" />
              <path d="M545 420C545 365 615 365 615 420V520H545V420Z" fill="#d9ae4a" />

              <circle cx="380" cy="330" r="22" fill="#f7f4ec" />
              <path d="M350 440C350 385 410 385 410 440V520H350V440Z" fill="#6c9f36" />

              {/* Curving Pathway across floor */}
              <path
                d="M60 560C260 500 420 540 840 440"
                stroke="#d9ae4a"
                strokeWidth="3.5"
                strokeOpacity="0.65"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Overlaid Active Group Card */}
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-[24px] bg-[#f7f4ec]/95 backdrop-blur-md border border-[#123f48]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#6c9f36] font-bold block mb-1">
                  CURRENT SPOTLIGHT
                </span>
                <h4 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0b3037]">
                  {whoWeHelpData.find((w) => w.id === activeGroupId)?.category} Pathway
                </h4>
              </div>

              <button
                onClick={() => onSelectGroup(activeGroupId)}
                className="px-6 py-2.5 rounded-full bg-[#0b3037] hover:bg-[#123f48] text-[#f7f4ec] font-heading font-bold text-xs shadow transition-colors"
              >
                Inquire For This Care Stage →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
