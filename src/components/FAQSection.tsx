import React, { useState } from 'react';
import { faqsData } from '../data/faqs';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(faqsData[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto" aria-label="Frequently Asked Questions">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#d9ae4a]" />
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase font-body text-[#6c9f36]">
            Questions & Answers
          </span>
        </div>
        <h2
          className="text-[#0b3037] font-heading font-extrabold tracking-tight mb-4"
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            lineHeight: 0.95
          }}
        >
          Common Inquiries
        </h2>
        <p className="text-base text-[#12333a]/75 font-body max-w-lg mx-auto">
          Clear answers about diagnostic assessments, multidisciplinary pathways, and scheduling.
        </p>
      </div>

      {/* Large Typography Accordion (Section 35: Full width, height 80-110px) */}
      <div className="space-y-4">
        {faqsData.map((faq, index) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-[#f7f4ec] border-[#0b3037]/20 shadow-[0_8px_24px_rgba(11,48,55,0.06)] ring-1 ring-[#0b3037]/5'
                  : 'bg-[#eee9dc]/50 border-[#123f48]/10 hover:bg-[#eee9dc]/80'
              }`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full text-left min-h-[85px] sm:min-h-[95px] p-6 sm:p-8 flex items-center justify-between gap-6 focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-5 sm:gap-6">
                  <span className="text-xs font-mono font-bold text-[#12333a]/40 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-lg sm:text-2xl font-heading font-bold text-[#0b3037] leading-snug">
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen
                      ? 'bg-[#0b3037] text-[#f7f4ec] rotate-45'
                      : 'bg-[#123f48]/10 text-[#0b3037]'
                  }`}
                >
                  <span className="text-lg font-medium leading-none">+</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-8 pb-8 pt-2 border-t border-[#123f48]/10 text-base text-[#12333a]/80 font-body leading-relaxed">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
