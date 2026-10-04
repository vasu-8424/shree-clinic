import React, { useState } from 'react';

export const TrustStrip: React.FC = () => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const words = [
    {
      word: 'HEAR',
      desc: 'Audiology & hearing care',
      accent: '#d9ae4a'
    },
    {
      word: 'SPEAK',
      desc: 'Speech, language & communication',
      accent: '#6c9f36'
    },
    {
      word: 'MOVE',
      desc: 'Physiotherapy & rehabilitation',
      accent: '#123f48'
    },
    {
      word: 'GROW',
      desc: 'Child development & family support',
      accent: '#d9ae4a'
    }
  ];

  return (
    <section
      className="py-14 sm:py-20 bg-[#eee9dc]/60 border-y border-[#123f48]/10 overflow-hidden"
      aria-label="Core Brand Service Strip"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {words.map((item) => {
            const isHovered = hoveredWord === item.word;

            return (
              <div
                key={item.word}
                onMouseEnter={() => setHoveredWord(item.word)}
                onMouseLeave={() => setHoveredWord(null)}
                className="cursor-pointer group flex flex-col justify-center transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ backgroundColor: item.accent }}
                  />
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#12333a]/50">
                    DISCIPLINE
                  </span>
                </div>

                {/* Oversized Word Expanding on Hover */}
                <h2
                  className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight font-heading leading-none transition-all duration-300 ${
                    isHovered
                      ? 'text-[#0b3037] scale-105 translate-x-1'
                      : 'text-[#123f48] group-hover:text-[#0b3037]'
                  }`}
                >
                  {item.word}
                </h2>

                {/* Description Appearing Underneath */}
                <p
                  className={`text-xs sm:text-sm font-medium font-body transition-all duration-300 mt-2 ${
                    isHovered ? 'text-[#0b3037] translate-y-0 opacity-100 font-semibold' : 'text-[#12333a]/70 opacity-90'
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
