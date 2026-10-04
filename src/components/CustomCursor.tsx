import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable below 768px and on touch devices (Section 41)
    if (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a, [role="button"], article, .cursor-pointer');
      if (clickable) {
        setIsHovering(true);
        if (target.closest('article, [id="resources"]')) {
          setHoverText('VIEW');
        } else if (target.closest('[id="services"], [id^="section-"]')) {
          setHoverText('EXPLORE');
        } else if (target.closest('.group')) {
          setHoverText('OPEN');
        } else {
          setHoverText('');
        }
      } else {
        setIsHovering(false);
        setHoverText('');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (isTouch || !isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[99] transition-transform duration-75 ease-out hidden md:block"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}
    >
      {/* Normal: 6px circle, Hover interactive: 40px circle (Section 41) */}
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHovering
            ? 'w-10 h-10 bg-[#d9ae4a]/95 text-[#0b3037] scale-100 shadow-xl'
            : 'w-1.5 h-1.5 bg-[#0b3037]/80 scale-100 ring-2 ring-[#d9ae4a]/40'
        }`}
      >
        {isHovering && hoverText && (
          <span className="text-[9px] font-heading font-extrabold tracking-tighter uppercase font-mono">
            {hoverText}
          </span>
        )}
      </div>
    </div>
  );
};
