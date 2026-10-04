import React from 'react';
import { useReveal } from '../hooks/useReveal';

interface TextRevealProps {
  lines: string[];
  className?: string;
  lineClassName?: (index: number) => string;
  serifIndex?: number;
  serifWord?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'div';
}

export const TextReveal: React.FC<TextRevealProps> = ({
  lines,
  className = '',
  lineClassName,
  serifWord,
  tag: Tag = 'h2'
}) => {
  const { ref, isRevealed } = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <Tag ref={ref} className={`overflow-hidden ${className}`}>
      {lines.map((line, idx) => {
        const isSerifLine = serifWord && line.includes(serifWord);

        return (
          <div key={idx} className="overflow-hidden">
            <div
              className={`transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                lineClassName ? lineClassName(idx) : ''
              }`}
              style={{
                transform: isRevealed ? 'translateY(0)' : 'translateY(100%)',
                opacity: isRevealed ? 1 : 0,
                transitionDelay: `${idx * 100}ms`
              }}
            >
              {isSerifLine ? (
                <>
                  {line.split(serifWord)[0]}
                  <span className="font-editorial not-italic px-1 font-normal">
                    {serifWord}
                  </span>
                  {line.split(serifWord)[1]}
                </>
              ) : (
                line
              )}
            </div>
          </div>
        );
      })}
    </Tag>
  );
};
