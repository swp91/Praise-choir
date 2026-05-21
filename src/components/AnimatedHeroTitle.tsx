'use client';

import type { CSSProperties } from 'react';

type Props = { text: string };
type CharStyle = CSSProperties & { '--i': number };

export default function AnimatedHeroTitle({ text }: Props) {
  const chars = Array.from(text);

  return (
    <span className="hero-type" aria-label={text}>
      <span className="hero-type__text" aria-hidden="true">
        {chars.map((char, index) => (
          <span
            className="hero-type__char"
            key={`${char}-${index}`}
            style={{ '--i': index } as CharStyle}
          >
            {char === ' ' ? '\u00a0' : char}
          </span>
        ))}
      </span>
      <span className="hero-type__rule" aria-hidden="true" />
      <span className="hero-type__glow" aria-hidden="true" />
    </span>
  );
}
