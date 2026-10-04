import React, { useRef, useState, useEffect } from 'react';

export interface MaskedImageCardProps {
  image: string;
  focalX?: number;
  className?: string;
  children?: React.ReactNode;
  aspect?: string;
  overlayGradient?: string;
}

export const MaskedImageCard: React.FC<MaskedImageCardProps> = ({
  image,
  focalX = 50,
  className = '',
  children,
  aspect = 'aspect-[16/10]',
  overlayGradient = 'bg-gradient-to-t from-[#0b3037]/90 via-[#0b3037]/30 to-transparent'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute background offset to create continuous shared-image window
  const bgPosX = `${focalX}%`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-[28px] border border-[#123f48]/15 shadow-[0_12px_36px_rgba(11,48,55,0.08)] group ${aspect} ${className}`}
    >
      {/* Background with Responsive Mask Offset */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: `${bgPosX} 50%`,
          backgroundSize: dimensions.width > 0 ? `max(100%, ${dimensions.width * 1.2}px) auto` : 'cover'
        }}
      />

      {/* Atmospheric Scrim for Legibility */}
      <div className={`absolute inset-0 ${overlayGradient} transition-opacity duration-300`} />

      {/* Floating Children Content */}
      {children && (
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10 text-[#f7f4ec]">
          {children}
        </div>
      )}
    </div>
  );
};
