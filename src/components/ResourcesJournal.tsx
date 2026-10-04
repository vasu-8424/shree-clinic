import React, { useState } from 'react';
import { resourcesData, ResourceArticle } from '../data/resources';

export const ResourcesJournal: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<ResourceArticle | null>(null);

  return (
    <section id="resources" className="py-24 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#0B292B]/10" aria-label="Editorial Healthcare Journal">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b border-[#0B292B]/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#2A5C41]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#2A5C41]">
              SHREE Clinical Journal & Insights
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0B292B] font-sans-display leading-[0.92]">
            Understand <br />
            your health <br />
            <span className="text-[#103B3E] font-editorial italic font-normal">better.</span>
          </h2>
        </div>

        <p className="max-w-md text-sm sm:text-base text-[#0B292B]/75 leading-relaxed">
          Evidence-based clinical writing written by our multidisciplinary team to illuminate communication, auditory perception, and neuro-motor health.
        </p>
      </div>

      {/* Editorial Journal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resourcesData.map((article, idx) => (
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group cursor-pointer flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-[#0B292B]/10 hover:border-[#0B292B]/30 hover:shadow-[0_16px_36px_rgba(11,41,43,0.06)] transition-all duration-300"
          >
            <div>
              {/* Architectural Article Header Art */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#0B292B] mb-6">
                <svg
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  viewBox="0 0 400 250"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={`resGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#144144" />
                      <stop offset="100%" stopColor="#0B292B" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="250" fill={`url(#resGrad-${idx})`} />
                  <circle cx="340" cy="50" r="120" fill="#DDA133" fillOpacity="0.25" />
                  <path d="M0 180C120 150 260 200 400 160" stroke="#2A5C41" strokeWidth="2" strokeOpacity="0.4" />
                  <path d="M40 220C180 180 280 230 380 200" stroke="#FAF8F5" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
                </svg>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B292B]/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#DDA133] bg-[#0B292B]/80 px-2.5 py-1 rounded backdrop-blur-sm">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Clean unboxed metadata with dot separator (anti-pill rule) */}
              <div className="flex items-center gap-2 text-xs text-[#0B292B]/50 mb-3">
                <span>{article.publishedDate}</span>
                <span aria-hidden="true">·</span>
                <span>{article.readTime}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B292B] group-hover:text-[#103B3E] transition-colors leading-tight mb-3 font-sans-display">
                {article.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#0B292B]/75 leading-relaxed mb-6">
                {article.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#0B292B]/10 flex items-center justify-between text-xs font-bold text-[#0B292B] group-hover:text-[#2A5C41]">
              <span>Read Clinical Monograph</span>
              <span className="text-[#DDA133] text-base transition-transform duration-200 group-hover:translate-x-1.5">→</span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#0B292B]/15 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#0B292B]/5 hover:bg-[#0B292B]/10 flex items-center justify-center text-sm font-bold text-[#0B292B]"
              aria-label="Close article modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#2A5C41] uppercase tracking-wider mb-2">
              <span>{selectedArticle.category}</span>
              <span>·</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B292B] font-sans-display mb-4">
              {selectedArticle.title}
            </h3>

            <p className="text-base text-[#0B292B]/85 leading-relaxed mb-6">
              {selectedArticle.excerpt}
            </p>

            <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#0B292B]/10 mb-8">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B292B] mb-3">
                Key Clinical Takeaways:
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#0B292B]/80 list-disc pl-4">
                {selectedArticle.keyTakeaways.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#0B292B]/10">
              <span className="text-xs text-[#0B292B]/60 italic font-editorial">
                Reviewed by SHREE Multidisciplinary Clinical Board
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-full bg-[#0B292B] text-[#FAF8F5] text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
