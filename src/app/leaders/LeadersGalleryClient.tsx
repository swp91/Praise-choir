'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { imageUrl } from '@/lib/media';
import type { Officer } from '@/lib/types';

interface LeadersGalleryClientProps {
  officers: Officer[];
}

type StreamCard = {
  officer: Officer;
  virtualIndex: number;
};

type FrameStyle = 'landscape' | 'portrait';

const EMPTY_OFFICERS: Officer[] = [
  {
    role: '임원',
    name: 'Praise Choir',
    part: 'Officers',
  },
];

const LANES = [
  { x: 9, start: 80, width: 29, tilt: -1.5, speed_x: -0.012, label: 'left-high' },
  { x: 39, start: 90, width: 33, tilt: 0.8, speed_x: 0.015, label: 'right-low' },
  { x: 62, start: 80, width: 27, tilt: -0.6, speed_x: -0.010, label: 'right-high' },
  { x: 21, start: 90, width: 31, tilt: 1.2, speed_x: 0.012, label: 'left-low' },
  { x: 50, start: 85, width: 36, tilt: -1.1, speed_x: -0.015, label: 'wide' },
];

const MOBILE_LANES = [
  { x: 9, start: 180, width: 60, tilt: -1.2, speed_x: -0.006, label: 'left-high' },
  { x: 31, start: 190, width: 62, tilt: 0.7, speed_x: 0.008, label: 'right-low' },
  { x: 14, start: 180, width: 60, tilt: -0.5, speed_x: -0.006, label: 'right-high' },
  { x: 23, start: 190, width: 61, tilt: 1.0, speed_x: 0.006, label: 'left-low' },
  { x: 11, start: 185, width: 67, tilt: -0.8, speed_x: -0.008, label: 'wide' },
];

function positiveModulo(value: number, modulo: number) {
  return ((value % modulo) + modulo) % modulo;
}

function buildCards(items: Officer[]): StreamCard[] {
  const minimumCards = Math.max(12, items.length * 3);

  return Array.from({ length: minimumCards }, (_, virtualIndex) => ({
    officer: items[virtualIndex % items.length],
    virtualIndex,
  }));
}

function getFrameStyle(officer: Officer, virtualIndex: number, appearanceCycle: number): FrameStyle {
  if (officer.name.includes('\uC9C4\uC21C\uC5F0')) return 'portrait';
  return (virtualIndex + appearanceCycle) % 2 === 0 ? 'portrait' : 'landscape';
}

function getRoleAdjustedLane(officer: Officer, baseLane: number, laneCount: number) {
  // Return baseLane to prevent consecutive cards from ending up in the same lane,
  // which was causing vertical overlapping. Staggered lanes naturally prevent overlap.
  return baseLane;
}

export default function LeadersGalleryClient({ officers }: LeadersGalleryClientProps) {
  const items = officers.length ? officers : EMPTY_OFFICERS;
  const streamCards = useMemo(() => buildCards(items), [items]);
  const [offset, setOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const dragOffsetStartRef = useRef(0);
  const spacing = isMobile ? 330 : 395;
  const cycleHeight = spacing * streamCards.length;

  const moveBy = useCallback((delta: number) => {
    targetOffsetRef.current = Math.max(0, targetOffsetRef.current + delta);
  }, []);

  useEffect(() => {
    document.body.classList.add('leaders-facil-page');
    return () => document.body.classList.remove('leaders-facil-page');
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 720);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const animate = () => {
      const diff = targetOffsetRef.current - currentOffsetRef.current;

      if (Math.abs(diff) > 0.04) {
        currentOffsetRef.current += diff * 0.18;
      } else {
        currentOffsetRef.current = targetOffsetRef.current;
      }

      setOffset(currentOffsetRef.current);
      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown') moveBy(280);
      if (event.key === 'ArrowUp' || event.key === 'PageUp') moveBy(-280);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveBy]);

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    event.preventDefault();
    const normalizedDelta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    moveBy(Math.max(-520, Math.min(820, normalizedDelta * 0.78)));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    dragStartRef.current = event.clientY;
    dragOffsetStartRef.current = targetOffsetRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (dragStartRef.current === null) return;
    const distance = dragStartRef.current - event.clientY;
    targetOffsetRef.current = Math.max(0, dragOffsetStartRef.current + distance * 1.4);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <main
      data-page-style="facil-officers"
      className="relative h-screen w-screen overflow-hidden bg-[#fdf9f0] text-[#171717] selection:bg-[#b89a5a] selection:text-[#fdf9f0]"
    >
      <style jsx global>{`
        body.leaders-facil-page {
          overflow: hidden !important;
          background: #fdf9f0;
        }

        body.leaders-facil-page header {
          color: #171717;
        }

        @media (prefers-reduced-motion: reduce) {
          body.leaders-facil-page .leaders-stream-card {
            transition: none !important;
          }
        }
      `}</style>

      <section
        className="pointer-events-none absolute left-0 top-0 z-0 flex h-full w-full items-end overflow-hidden pb-1"
        aria-hidden="true"
      >
        <div
          data-testid="leaders-background-type"
          className="w-full md:max-w-[750px] lg:max-w-[850px] md:pl-12 lg:pl-20"
        >
          <svg viewBox="0 0 800 360" className="w-full h-auto translate-y-[20px]" preserveAspectRatio="xMidYMax meet">
            <text
              x="0"
              y="150"
              textAnchor="start"
              fill="#171717"
              style={{
                fontSize: '170px',
                fontFamily: 'var(--font-cormorant), "Times New Roman", serif',
                fontWeight: 800,
                stroke: '#171717',
                strokeWidth: '5px',
                paintOrder: 'stroke fill',
                strokeLinejoin: 'round',
              }}
              className="uppercase"
            >
              CHOIR
            </text>
            <text
              x="50%"
              y="320"
              textAnchor="middle"
              textLength="800"
              lengthAdjust="spacingAndGlyphs"
              fill="#171717"
              style={{
                fontSize: '170px',
                fontFamily: 'var(--font-cormorant), "Times New Roman", serif',
                fontWeight: 800,
                stroke: '#171717',
                strokeWidth: '5px',
                paintOrder: 'stroke fill',
                strokeLinejoin: 'round',
              }}
              className="uppercase"
            >
              OFFICERS
            </text>
          </svg>
        </div>
      </section>



      <section
        aria-label="Infinite officer portrait stream"
        className="absolute inset-0 z-10 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {streamCards.map(({ officer, virtualIndex }) => {
          const laneSet = isMobile ? MOBILE_LANES : LANES;
          const exitOffset = isMobile ? 400 : 1350;
          const lifecycleConfig = laneSet[virtualIndex % laneSet.length];
          const appearanceCycle = Math.max(
            0,
            Math.floor((offset - (lifecycleConfig.start + virtualIndex * spacing + exitOffset)) / cycleHeight) + 1,
          );
          const baseLayoutLane = positiveModulo(virtualIndex + appearanceCycle * 2, laneSet.length);
          const layoutLane = getRoleAdjustedLane(officer, baseLayoutLane, laneSet.length);
          const config = laneSet[layoutLane];
          const y = config.start + virtualIndex * spacing - offset + appearanceCycle * cycleHeight;
          const labelReverse = (virtualIndex + appearanceCycle) % 4 === 1 || (virtualIndex + appearanceCycle) % 4 === 2;
          const activeBand = y > 130 && y < 610;
          const imageSrc = imageUrl(officer.photo);
          const frame = getFrameStyle(officer, virtualIndex, appearanceCycle);
          const cardWidth =
            frame === 'portrait'
              ? isMobile
                ? 'clamp(180px, 52vw, 230px)'
                : 'clamp(220px, 21vw, 360px)'
              : `clamp(210px, ${config.width}vw, 560px)`;

          const y_center = isMobile ? 350 : 450;
          const leftPos = config.x + (y_center - y) * config.speed_x;

          return (
            <article
              key={`${officer.name}-${virtualIndex}`}
              data-testid="officer-card"
              data-frame={frame}
              data-layout={`${layoutLane}-${appearanceCycle}`}
              data-cycle={`${appearanceCycle}-${layoutLane}`}
              className="leaders-stream-card absolute select-none"
              style={{
                left: `${leftPos.toFixed(2)}%`,
                top: 0,
                width: cardWidth,
                transform: `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${config.tilt}deg)`,
                zIndex: activeBand ? 8 : 4 + (virtualIndex % 3),
                opacity: y < -exitOffset || y > 1050 ? 0 : 1,
              }}
            >
              <div
                className={`relative bg-[#171717] shadow-[0_20px_50px_rgba(0,0,0,0.18)] ${
                  frame === 'portrait' ? 'aspect-[4/5]' : 'aspect-[16/10]'
                }`}
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={officer.name}
                    fill
                    priority={virtualIndex < 8}
                    sizes="(max-width: 720px) 76vw, 560px"
                    className="object-cover"
                    style={{ objectPosition: frame === 'portrait' ? 'center 28%' : 'center center' }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#171717]">
                    <span className="font-en text-[72px] font-black uppercase leading-none text-white">{officer.name.slice(0, 1)}</span>
                  </div>
                )}

                <div
                  className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-between gap-3 max-[720px]:left-[-24px] max-[720px]:w-[calc(100%+48px)] ${
                    labelReverse ? 'left-[-40px] w-[calc(100%+80px)] flex-row-reverse' : 'left-[-56px] w-[calc(100%+96px)]'
                  }`}
                >
                  <span
                    data-testid="officer-role-label"
                    className="max-w-[46%] bg-[#f5eed9]/95 px-3 py-2 font-ko text-[16px] font-black leading-none text-[#8a6f2f] shadow-[0_8px_16px_rgba(42,38,32,0.08)] ring-1 ring-[#b89a5a]/25 sm:text-[20px]"
                  >
                    {officer.role}
                  </span>
                  <span
                    data-testid="officer-name-label"
                    className="max-w-[52%] bg-[#fdf9f0]/95 px-3 py-1.5 font-ko text-[13px] font-bold leading-none text-[#2a2620] shadow-[0_8px_16px_rgba(42,38,32,0.08)] ring-1 ring-[#b89a5a]/20 sm:text-[16px]"
                  >
                    {officer.name}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex justify-end font-ko text-[11px] font-bold text-[#171717]/45">
                {officer.part || config.label}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
