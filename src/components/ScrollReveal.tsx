'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
};

export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.15,
}: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect(); // 한 번 리빌되면 감지용 리스너는 깔끔히 종료
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={containerRef}
      className={`reveal-container ${isRevealed ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
