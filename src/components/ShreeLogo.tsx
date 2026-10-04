import React from 'react';

interface ShreeLogoProps {
  variant?: 'navbar' | 'full' | 'icon-only' | 'hero' | 'splash';
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ShreeLogo: React.FC<ShreeLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'dark',
  size = 'md'
}) => {
  const isLight = theme === 'light';
  const textColor = isLight ? '#f7f4ec' : '#0b3037';
  const subtextColor = isLight ? '#dfe9cf' : '#6c9f36';

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* SHREE Brand Emblem: Deep Teal, Leaf Green, Warm Gold, Cream, Human figures, Tree, Path, Sun */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105`}
        aria-label="SHREE Logo — Tree, Pathway, Rising Sun & Care"
      >
        <defs>
          <radialGradient id="shreeSunGlow" cx="50%" cy="30%" r="45%">
            <stop offset="0%" stopColor="#f5d77f" />
            <stop offset="60%" stopColor="#d9ae4a" />
            <stop offset="100%" stopColor="#b6892e" />
          </radialGradient>

          <linearGradient id="shreeTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c9f36" />
            <stop offset="60%" stopColor="#2e683b" />
            <stop offset="100%" stopColor="#123f48" />
          </linearGradient>

          <linearGradient id="shreePathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#123f48" />
            <stop offset="50%" stopColor="#6c9f36" />
            <stop offset="85%" stopColor="#d9ae4a" />
            <stop offset="100%" stopColor="#f5d77f" />
          </linearGradient>
        </defs>

        {/* Outer Circular Sacred Shield */}
        <circle cx="50" cy="50" r="46" stroke="#d9ae4a" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
        <circle cx="50" cy="50" r="43" fill={isLight ? "#0b3037" : "#f7f4ec"} />

        {/* Rising Golden Sun */}
        <circle cx="50" cy="33" r="14" fill="url(#shreeSunGlow)" />
        <path d="M50 14V17M37 20L39 22M63 20L61 22" stroke="#d9ae4a" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />

        {/* Flourishing Tree Canopy (Growth & Long-Term Wellbeing) */}
        <path
          d="M50 25C43 25 36 31 37 38C32 40 30 46 34 51C36 53 40 54 44 53C47 57 53 57 56 53C60 54 64 53 66 51C70 46 68 40 63 38C64 31 57 25 50 25Z"
          fill="url(#shreeTreeGrad)"
        />

        {/* Human figures embracing (Therapist & Patient) */}
        <circle cx="44" cy="46" r="3.2" fill={isLight ? "#0b3037" : "#f7f4ec"} />
        <circle cx="56" cy="48" r="2.8" fill={isLight ? "#0b3037" : "#f7f4ec"} />
        <path
          d="M40 58C40 52 48 51 48 58M52 59C52 54 60 53 60 59"
          stroke={isLight ? "#0b3037" : "#f7f4ec"}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* The Winding Journey Pathway leading towards the Golden Sun */}
        <path
          d="M32 86C42 74 38 68 50 60C62 52 50 42 50 33"
          stroke="url(#shreePathGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M38 88C48 76 44 70 52 64"
          stroke="#d9ae4a"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
      </svg>

      {/* Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-extrabold tracking-tight font-heading uppercase"
              style={{ color: textColor, letterSpacing: '0.04em' }}
            >
              SHREE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#d9ae4a]" />
          </div>
          {variant !== 'navbar' && (
            <span
              className="text-[10px] tracking-[0.16em] uppercase font-medium mt-1 font-body"
              style={{ color: subtextColor }}
            >
              Audiology · Speech · Physiotherapy
            </span>
          )}
        </div>
      )}
    </div>
  );
};
