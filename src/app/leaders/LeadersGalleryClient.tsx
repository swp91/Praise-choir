'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { imageUrl } from '@/lib/media';
import type { Officer } from '@/lib/types';

interface LeadersGalleryClientProps {
  officers: Officer[];
}

const EMPTY_OFFICERS: Officer[] = [
  {
    role: 'Officers',
    name: 'Praise Choir',
    part: 'No officers registered',
  },
];

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function cardOffset(index: number, position: number, total: number) {
  let raw = index - position;
  while (raw > total / 2) raw -= total;
  while (raw < -total / 2) raw += total;
  return raw;
}

export default function LeadersGalleryClient({ officers }: LeadersGalleryClientProps) {
  const items = officers.length ? officers : EMPTY_OFFICERS;
  const [reelPosition, setReelPosition] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentPositionRef = useRef(0);
  const targetPositionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const dragTargetStartRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragDivisorRef = useRef(150);

  const activeIndex = wrapIndex(Math.round(reelPosition), items.length);
  const activeOfficer = items[activeIndex] ?? items[0];

  useEffect(() => {
    document.body.classList.add('leaders-voku-page');
    return () => document.body.classList.remove('leaders-voku-page');
  }, []);

  const move = useCallback(
    (direction: 1 | -1) => {
      setDetailsOpen(false);
      targetPositionRef.current += direction;
    },
    [],
  );

  const visibleCards = useMemo(
    () =>
      items.map((officer, index) => ({
        officer,
        index,
        offset: cardOffset(index, reelPosition, items.length),
      })),
    [items, reelPosition],
  );

  useEffect(() => {
    const animate = () => {
      const diff = targetPositionRef.current - currentPositionRef.current;

      if (Math.abs(diff) > 0.0008) {
        currentPositionRef.current += diff * 0.12;
        setReelPosition(currentPositionRef.current);
      } else if (currentPositionRef.current !== targetPositionRef.current) {
        currentPositionRef.current = targetPositionRef.current;
        setReelPosition(currentPositionRef.current);
      }

      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'Escape') setDetailsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  useEffect(() => {
    if (isPaused) return;

    const advanceId = window.setInterval(() => {
      move(1);
    }, 5200);

    return () => {
      window.clearInterval(advanceId);
    };
  }, [isPaused, move]);

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) < 0.1) return;
    event.preventDefault();
    setDetailsOpen(false);
    const normalizedDelta =
      event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    const wheelStep = Math.max(-1.2, Math.min(1.2, normalizedDelta * 0.025));
    targetPositionRef.current += wheelStep;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    dragStartRef.current = event.clientX;
    dragTargetStartRef.current = targetPositionRef.current;
    dragMovedRef.current = false;
    
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 480) {
        dragDivisorRef.current = 64;
      } else if (window.innerWidth <= 768) {
        dragDivisorRef.current = 72;
      } else if (window.innerWidth <= 1024) {
        dragDivisorRef.current = 80;
      } else {
        const computedStep = Math.max(48, Math.min(190, window.innerWidth * 0.125));
        dragDivisorRef.current = computedStep;
      }
    }

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (dragStartRef.current === null) return;
    const distance = event.clientX - dragStartRef.current;

    if (Math.abs(distance) > 8) {
      dragMovedRef.current = true;
      setDetailsOpen(false);
      targetPositionRef.current = dragTargetStartRef.current - distance / dragDivisorRef.current;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (dragStartRef.current === null) return;

    const distance = event.clientX - dragStartRef.current;
    dragStartRef.current = null;

    if (Math.abs(distance) <= 8) return;
  };

  // Fullscreen helper removed as HUD is hidden

  return (
    <main
      data-page-style="voku-officers"
      className="relative h-screen w-screen overflow-hidden bg-[#fffdfc] text-[#0a0a0a] selection:bg-black selection:text-white"
    >
      <style jsx global>{`
        body.leaders-voku-page {
          --min-card-width: 82px;
          --min-card-step: 48px;
        }

        @media (max-width: 1024px) {
          body.leaders-voku-page {
            --min-card-width: 150px;
            --min-card-step: 80px;
          }
        }

        @media (max-width: 768px) {
          body.leaders-voku-page {
            --min-card-width: 130px;
            --min-card-step: 72px;
          }
          body.leaders-voku-page [data-slot="3"] {
            opacity: 0 !important;
            pointer-events: none !important;
          }
        }

        @media (max-width: 480px) {
          body.leaders-voku-page {
            --min-card-width: 120px;
            --min-card-step: 64px;
          }
        }

        body.leaders-voku-page header {
          display: none !important;
        }

        @keyframes officer-pulse {
          0%,
          100% {
            transform: scale(0.88);
            opacity: 0.1;
          }
          50% {
            transform: scale(1);
            opacity: 0.32;
          }
        }

        @keyframes officer-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>

      {/* Top Center: Roulette active officer name & role */}
      <div className="absolute top-[4.5vh] sm:top-[6vh] left-1/2 -translate-x-1/2 z-20 h-[50px] overflow-hidden text-center pointer-events-none w-full flex justify-center">
        <div 
          className="transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translate3d(0, calc(-1 * ${activeIndex} * 50px), 0)` }}
        >
          {items.map((officer, index) => (
            <div key={index} className="h-[50px] flex items-center justify-center whitespace-nowrap text-[18px] sm:text-[22px] tracking-wide">
              <span className="font-semibold text-neutral-400 mr-2.5">{officer.role}</span>
              <span className="font-bold text-neutral-900">{officer.name}</span>
            </div>
          ))}
        </div>
      </div>

      <section
        data-testid="officer-stage"
        aria-label="Officer photo reel"
        className="absolute inset-x-0 top-[6vh] z-10 mx-auto h-[44vh] min-h-[340px] max-w-[1260px] touch-pan-y overflow-visible max-[768px]:top-[16vh] max-[768px]:h-[43vh] max-[768px]:min-h-[360px]"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {visibleCards.map(({ officer, index, offset }) => {
            const absOffset = Math.abs(offset);
            const signedSlot = cardOffset(index, activeIndex, items.length);
            const absSlot = Math.abs(signedSlot);
            const isActive = Math.abs(offset) < 0.5;
            const clamped = Math.max(-3.6, Math.min(3.6, offset));
            const y = Math.pow(Math.min(absOffset, 5), 1.28) * 28;
            const scale = Math.max(0.56, 1.03 - Math.min(absOffset, 5) * 0.075);
            const opacity = absSlot <= 3 ? Math.max(0.18, 1 - absOffset * 0.11) : 0;
            const width = 'clamp(var(--min-card-width, 82px), 13vw, 248px)';
            const zIndex = Math.round(1000 - absOffset * 100);
            const imageSrc = imageUrl(officer.photo);

            return (
              <button
                key={`${officer.name}-${index}`}
                type="button"
                data-testid="officer-card"
                data-reel-offset={absOffset.toFixed(4)}
                data-reel-signed-offset={signedSlot.toFixed(4)}
                data-reel-scale={scale.toFixed(4)}
                data-slot={absSlot}
                className="group absolute aspect-square overflow-hidden bg-black text-white shadow-none outline-none focus-visible:ring-2 focus-visible:ring-black"
                style={{
                  width,
                  zIndex,
                  opacity,
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${clamped.toFixed(4)} * clamp(var(--min-card-step, 48px), 12.5vw, 190px)), calc(-50% + ${y}px), 0) scale(${scale})`,
                  filter: 'none',
                }}
                aria-label={`Show ${officer.name}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => {
                  if (dragMovedRef.current) return;
                  if (isActive) {
                    setDetailsOpen(true);
                  } else {
                    setDetailsOpen(false);
                    targetPositionRef.current += offset;
                  }
                }}
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={officer.name}
                    fill
                    priority={absOffset < 3}
                    sizes="(max-width: 768px) 60vw, 310px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black">
                    <span className="font-en text-[clamp(42px,6vw,82px)] font-semibold uppercase tracking-normal text-white">
                      {officer.name.slice(0, 1)}
                    </span>
                  </div>
                )}

                <span className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/10" />
                {isActive ? (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 text-center font-en text-[clamp(18px,2vw,28px)] font-semibold uppercase leading-none tracking-normal text-white mix-blend-difference">
                    {officer.role}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Bottom navigation HUD removed as requested */}

      <div className="pointer-events-none absolute inset-x-0 bottom-[19vh] z-0 flex justify-center max-[768px]:bottom-[15vh]">
        <div className="relative h-28 w-44 opacity-60">
          {Array.from({ length: 7 }).map((_, index) => {
            const angle = (-95 + index * 31) * (Math.PI / 180);
            const left = 78 + Math.cos(angle) * 66;
            const top = 58 + Math.sin(angle) * 52;

            return (
              <span
                key={index}
                className="absolute block rounded-full border border-[#d9d9d9]"
                style={{
                  left,
                  top,
                  width: index === 3 ? 68 : 38,
                  height: index === 3 ? 68 : 38,
                  animation: `officer-pulse 2.2s ease-in-out ${index * 0.14}s infinite`,
                }}
              />
            );
          })}
        </div>
      </div>
      {/* Bottom Center: '섬김의 손길들' large font header */}
      <div className="absolute top-[64vh] sm:top-[62vh] left-1/2 -translate-x-1/2 z-20 w-full text-center pointer-events-none max-[768px]:top-[70vh] flex flex-col items-center">
        <h2 className="text-[28px] sm:text-[38px] font-bold text-neutral-800 tracking-wider">
          섬김의 손길들
        </h2>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-0 right-0 z-0 overflow-hidden opacity-[0.035]">
        <div className="flex min-w-[200%] animate-none whitespace-nowrap font-en text-[80px] font-bold uppercase leading-none tracking-normal max-[768px]:text-[52px]" style={{ animation: 'officer-marquee 38s linear infinite' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} className="mr-10">
              Praise Choir Officers
            </span>
          ))}
        </div>
      </div>

      {detailsOpen ? (
        <div
          role="dialog"
          aria-label="Officer details"
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#fffdfc]/92 px-5 pb-10 backdrop-blur-sm max-[768px]:items-center max-[768px]:pb-0"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="w-full max-w-[720px] border-t border-black pt-5 font-en text-black"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[12px] font-bold uppercase leading-none tracking-normal">Officer details</p>
                <p className="mt-5 text-[clamp(42px,7vw,88px)] font-bold uppercase leading-[0.88] tracking-normal">
                  {activeOfficer.name}
                </p>
              </div>
              <button type="button" aria-label="Close details" className="text-[13px] font-bold underline underline-offset-4" onClick={() => setDetailsOpen(false)}>
                Close
              </button>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-4 text-[15px] font-bold leading-tight max-[560px]:grid-cols-1">
              <div>
                <dt className="text-black/40">Role</dt>
                <dd className="mt-1">{activeOfficer.role}</dd>
              </div>
              <div>
                <dt className="text-black/40">Part</dt>
                <dd className="mt-1">{activeOfficer.part || 'Praise Choir'}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </main>
  );
}
