import React from 'react';
import { useReveal } from '../hooks/useReveal';

interface ImageRevealProps {
  children: React.ReactNode;
  direction?: 'left-to-right' | 'bottom-to-top' | 'center';
  className?: string;
  delayMs?: number;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  children,
  direction = 'left-to-right',
  className = '',
  delayMs = 0
}) => {
  const { ref, isRevealed } = useReveal<HTMLDivElement>({ threshold: 0.15 });

  const getClipPath = () => {
    if (isRevealed) {
      return 'inset(0% 0% 0% 0%)';
    }
    switch (direction) {
      case 'left-to-right':
        return 'inset(0% 100% 0% 0%)';
      case 'bottom-to-top':
        return 'inset(100% 0% 0% 0%)';
      case 'center':
        return 'inset(50% 50% 50% 50%)';
    }
  };

  return (
    <div
      ref={ref}
      className={`overflow-hidden transition-all duration-[1100ms] ${className}`}
      style={{
        clipPath: getClipPath(),
        transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
        transitionDelay: `${delayMs}ms`
      }}
    >
      {children}
    </div>
  );
};
