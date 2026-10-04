import React, { useState } from 'react';
import { servicesData } from '../data/services';

interface ServiceExplorerProps {
  onSelectService: (serviceId: string) => void;
  onBookService: (serviceName: string) => void;
}

export const ServiceExplorer: React.FC<ServiceExplorerProps> = ({
  onSelectService,
  onBookService
}) => {
  const [activeServiceId, setActiveServiceId] = useState<string>('audiology');
  const activeService = servicesData.find((s) => s.id === activeServiceId) || servicesData[0];

  return (
    <section
      id="services"
      className="py-28 sm:py-36 px-6 sm:px-8 max-w-[1440px] mx-auto"
      aria-label="How Can We Help Service Explorer"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* LEFT COLUMN: Huge Heading (Section 19) */}
        <div className="lg:col-span-5 sticky top-32">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d9ae4a]" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase font-body text-[#6c9f36]">
              Clinical Navigation
            </span>
          </div>

          <h2
            className="text-[#0b3037] font-heading font-extrabold tracking-tight mb-8"
            style={{
              fontSize: 'clamp(3.5rem, 7vw, 6.5rem)',
              lineHeight: 0.88,
              letterSpacing: '-0.055em'
            }}
          >
            HOW <br />
            CAN <br />
            WE <br />
            <span className="text-[#123f48] font-editorial italic font-normal">help?</span>
          </h2>

          <p className="text-base sm:text-lg text-[#12333a]/80 font-body leading-relaxed mb-8 max-w-md">
            Our three central clinical disciplines coordinate seamlessly under one roof, providing diagnostic precision and continuous therapeutic milestones.
          </p>

          <div className="pt-6 border-t border-[#123f48]/10 flex items-center gap-4">
            <button
              onClick={() => onSelectService(activeService.id)}
              className="text-xs sm:text-sm font-bold font-heading text-[#0b3037] hover:text-[#6c9f36] flex items-center gap-2 group transition-colors"
            >
              <span>Explore {activeService.category} Department</span>
              <span className="text-[#d9ae4a] transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Large Interactive Service Panel (Section 19) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {servicesData.slice(0, 3).map((service) => {
            const isActive = service.id === activeServiceId;

            return (
              <div
                key={service.id}
                onMouseEnter={() => setActiveServiceId(service.id)}
                onClick={() => setActiveServiceId(service.id)}
                className={`cursor-pointer rounded-[28px] border transition-all duration-500 overflow-hidden ${
                  isActive
                    ? 'bg-[#0b3037] text-[#f7f4ec] border-[#0b3037] shadow-[0_20px_48px_rgba(11,48,55,0.18)] scale-[1.01]'
                    : 'bg-[#f7f4ec] text-[#0b3037] border-[#123f48]/10 hover:border-[#123f48]/25 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="p-6 sm:p-10">
                  {/* Top Bar with Number & Gold Line when Active */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-bold tracking-widest ${
                        isActive ? 'text-[#d9ae4a]' : 'text-[#12333a]/40'
                      }`}
                    >
                      {service.number}
                    </span>

                    {isActive && (
                      <div className="h-0.5 w-16 bg-[#d9ae4a] rounded-full animate-pulse" />
                    )}

                    <span
                      className={`text-xs uppercase tracking-wider font-semibold ${
                        isActive ? 'text-[#dfe9cf]' : 'text-[#6c9f36]'
                      }`}
                    >
                      {service.subServices.length} Procedures
                    </span>
                  </div>

                  {/* Service Title Expanding */}
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className={`font-heading font-extrabold tracking-tight transition-all duration-300 ${
                        isActive
                          ? 'text-3xl sm:text-4xl text-[#f7f4ec]'
                          : 'text-2xl sm:text-3xl text-[#0b3037]'
                      }`}
                    >
                      {service.category}
                    </h3>

                    {/* Arrow Indicator */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? 'bg-[#d9ae4a] text-[#0b3037] rotate-45 scale-110 shadow-md'
                          : 'bg-[#123f48]/10 text-[#0b3037]'
                      }`}
                    >
                      <span className="text-base font-bold">↗</span>
                    </div>
                  </div>

                  {/* Active Description Slides In */}
                  {isActive && (
                    <div className="mt-6 pt-6 border-t border-[#f7f4ec]/15">
                      <p className="text-sm text-[#f7f4ec]/85 font-body leading-relaxed mb-6">
                        {service.summary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {service.subServices.slice(0, 4).map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-[#123f48]/50 p-3.5 rounded-xl border border-[#f7f4ec]/10 text-xs"
                          >
                            <span className="font-heading font-bold text-[#f7f4ec] block mb-0.5">
                              {sub.name}
                            </span>
                            <span className="text-[#f7f4ec]/70 text-[11px] block line-clamp-1">
                              {sub.indication}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectService(service.id);
                          }}
                          className="px-5 py-2.5 rounded-full bg-[#f7f4ec] text-[#0b3037] font-heading font-bold text-xs hover:bg-[#eee9dc] transition-colors"
                        >
                          View Full {service.category} Experience ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookService(service.category);
                          }}
                          className="px-5 py-2.5 rounded-full bg-[#d9ae4a] text-[#0b3037] font-heading font-bold text-xs hover:bg-[#e4be60] transition-colors shadow-sm"
                        >
                          Book Evaluation →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
