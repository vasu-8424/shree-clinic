import React, { useEffect, useState } from 'react';
import { ShreeLogo } from './ShreeLogo';

interface BrandIntroProps {
  onComplete: () => void;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'logo' | 'pathway' | 'quote' | 'exiting'>('logo');

  useEffect(() => {
    // 0 - 800ms: Logo scales and fades in
    const t1 = setTimeout(() => setStage('pathway'), 800);
    // 800ms - 1500ms: Pathway animates & Tagline reveals
    const t2 = setTimeout(() => setStage('quote'), 1400);
    // 1900ms: Exit animation initiates
    const t3 = setTimeout(() => setStage('exiting'), 2000);
    // 2700ms: Complete and remove from DOM
    const t4 = setTimeout(() => onComplete(), 2700);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f7f4ec] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        stage === 'exiting' ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="SHREE Brand Introduction"
    >
      {/* Background warm golden dawn glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#d9ae4a]/25 via-[#6c9f36]/15 to-transparent blur-3xl transition-transform duration-1000 ${
            stage !== 'logo' ? 'scale-125 opacity-80' : 'scale-90 opacity-30'
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Central Logo Container */}
        <div
          className={`transition-all duration-800 ease-out transform ${
            stage === 'logo'
              ? 'opacity-100 scale-100'
              : 'opacity-100 scale-100'
          }`}
        >
          <ShreeLogo variant="splash" size="xl" />
        </div>

        {/* Eyebrow Label */}
        <p
          className={`mt-6 text-[11px] font-bold tracking-[0.2em] uppercase font-body text-[#123f48] transition-all duration-700 ${
            stage !== 'logo'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          Audiology · Speech · Physiotherapy
        </p>

        {/* Animated Thin Pathway from Left to Right */}
        <div className="w-48 h-6 my-4 overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 200 24" className="w-full h-full" fill="none">
            <path
              d="M0 12 C 50 2, 100 22, 200 12"
              stroke="#123f48"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="220"
              strokeDashoffset={stage === 'logo' ? '220' : '0'}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            <circle
              cx="195"
              cy="12"
              r="4"
              fill="#d9ae4a"
              className={`transition-opacity duration-500 delay-500 ${
                stage !== 'logo' ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </svg>
        </div>

        {/* Tagline: "CARE THAT HELPS YOU MOVE FORWARD." with editorial serif for 'move forward' */}
        <div
          className={`transition-all duration-700 overflow-hidden ${
            stage === 'quote' || stage === 'exiting'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-lg sm:text-xl font-body font-medium text-[#12333a] tracking-tight">
            Care that helps you{' '}
            <span className="font-editorial text-2xl sm:text-3xl text-[#0b3037] font-normal not-italic px-1">
              move forward.
            </span>
          </p>
        </div>

        {/* Skip button for immediate user control */}
        <button
          onClick={onComplete}
          className="mt-8 text-[11px] font-mono tracking-widest uppercase text-[#123f48]/50 hover:text-[#123f48] transition-colors py-1 px-3 rounded-full hover:bg-black/5"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
};
