'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
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

const DEFAULT_PALETTE = ['#b89a5a', '#f5eed9', '#8a6f2f', '#e6dec9', '#b89a5a'];

async function extractColors(url: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(DEFAULT_PALETTE);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_PALETTE);
          return;
        }
        ctx.drawImage(img, 0, 0, 10, 10);
        // Sample colors from 5 points on the 10x10 canvas to get representative colors
        const points = [
          [1, 1], // top-left
          [8, 1], // top-right
          [5, 5], // center
          [2, 8], // bottom-left
          [7, 8], // bottom-right
        ];
        const colors = points.map(([x, y]) => {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        });
        resolve(colors);
      } catch (err) {
        console.warn('CORS or canvas error extracting colors:', err);
        resolve(DEFAULT_PALETTE);
      }
    };
    img.onerror = () => {
      resolve(DEFAULT_PALETTE);
    };
  });
}

export default function LeadersGalleryClient({ officers }: LeadersGalleryClientProps) {
  const items = officers.length ? officers : EMPTY_OFFICERS;
  const [reelPosition, setReelPosition] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPaused] = useState(false);
  const currentPositionRef = useRef(0);
  const targetPositionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const dragTargetStartRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragDivisorRef = useRef(150);
  const wheelTimeoutRef = useRef<number | null>(null);
  const [colorPalettes, setColorPalettes] = useState<Record<number, string[]>>({});

  const activeIndex = wrapIndex(Math.round(reelPosition), items.length);
  const activeOfficer = items[activeIndex] ?? items[0];

  useEffect(() => {
    // Extract colors for all officers on client side
    const extractAll = async () => {
      const palettes: Record<number, string[]> = {};
      for (let i = 0; i < items.length; i++) {
        const photo = items[i]?.photo;
        if (photo) {
          const src = imageUrl(photo);
          palettes[i] = await extractColors(src);
        } else {
          palettes[i] = DEFAULT_PALETTE;
        }
      }
      setColorPalettes(palettes);
    };
    extractAll();
  }, [items]);

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
      if (wheelTimeoutRef.current) window.clearTimeout(wheelTimeoutRef.current);
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

  useEffect(() => {
    const handleNativeWheel = (event: WheelEvent) => {
      // 모달 상세 창이 열려 있을 때는 모달 내 스크롤을 허용하기 위해 이벤트를 가로채지 않습니다.
      if (detailsOpen) return;

      if (Math.abs(event.deltaY) < 0.1) return;
      event.preventDefault();
      setDetailsOpen(false);
      const normalizedDelta =
        event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      const wheelStep = Math.max(-1.2, Math.min(1.2, normalizedDelta * 0.025));
      targetPositionRef.current += wheelStep;

      if (wheelTimeoutRef.current) {
        window.clearTimeout(wheelTimeoutRef.current);
      }
      wheelTimeoutRef.current = window.setTimeout(() => {
        targetPositionRef.current = Math.round(targetPositionRef.current);
      }, 150);
    };

    window.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleNativeWheel);
    };
  }, [detailsOpen]);

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

    targetPositionRef.current = Math.round(targetPositionRef.current);

    if (Math.abs(distance) <= 8) return;
  };

  // Fullscreen helper removed as HUD is hidden

  return (
    <main
      data-page-style="voku-officers"
      className="relative h-screen w-screen overflow-hidden bg-[#fffdfc] text-[#0a0a0a] selection:bg-black selection:text-white font-ko"
    >
      {/* Dynamic Blurred Background with SVG Marble Warp */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000 ease-in-out">
        {items.map((officer, index) => {
          const isActive = index === activeIndex;
          const colors = colorPalettes[index] || DEFAULT_PALETTE;
          
          // Vary the abstract layout based on index to create completely unique patterns
          const layoutStyle = index % 3 === 0 ? (
            // Layout 0: Quad split with center cross overlay
            <div className="absolute inset-0 w-full h-full flex flex-wrap">
              <div className="w-1/2 h-1/2" style={{ backgroundColor: colors[0] }} />
              <div className="w-1/2 h-1/2" style={{ backgroundColor: colors[1] }} />
              <div className="w-1/2 h-1/2" style={{ backgroundColor: colors[3] }} />
              <div className="w-1/2 h-1/2" style={{ backgroundColor: colors[4] }} />
              <div className="absolute w-[60%] h-[60%] left-[20%] top-[20%] rounded-full opacity-70 mix-blend-multiply" style={{ backgroundColor: colors[2] }} />
              <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{
                background: `radial-gradient(circle at 30% 30%, ${colors[1]} 0%, transparent 60%), radial-gradient(circle at 70% 70%, ${colors[3]} 0%, transparent 60%)`
              }} />
            </div>
          ) : index % 3 === 1 ? (
            // Layout 1: Horizontal bands with offset circular blobs
            <div className="absolute inset-0 w-full h-full flex flex-col">
              <div className="w-full h-1/3" style={{ backgroundColor: colors[0] }} />
              <div className="w-full h-1/3" style={{ backgroundColor: colors[2] }} />
              <div className="w-full h-1/3" style={{ backgroundColor: colors[4] }} />
              <div className="absolute w-[45%] h-[45%] left-[10%] top-[40%] rounded-full opacity-80 mix-blend-screen" style={{ backgroundColor: colors[1] }} />
              <div className="absolute w-[45%] h-[45%] right-[10%] top-[10%] rounded-full opacity-80 mix-blend-multiply" style={{ backgroundColor: colors[3] }} />
              <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{
                background: `radial-gradient(circle at 10% 80%, ${colors[0]} 0%, transparent 70%), radial-gradient(circle at 90% 20%, ${colors[4]} 0%, transparent 70%)`
              }} />
            </div>
          ) : (
            // Layout 2: Vertical columns with multi-stop linear gradients
            <div className="absolute inset-0 w-full h-full flex">
              <div className="w-1/3 h-full" style={{ backgroundColor: colors[0] }} />
              <div className="w-1/3 h-full" style={{ backgroundColor: colors[1] }} />
              <div className="w-1/3 h-full" style={{ backgroundColor: colors[4] }} />
              <div className="absolute inset-y-0 left-[20%] w-[30%] opacity-85 mix-blend-color-burn" style={{ backgroundColor: colors[2] }} />
              <div className="absolute inset-y-0 right-[20%] w-[30%] opacity-85 mix-blend-hard-light" style={{ backgroundColor: colors[3] }} />
              <div className="absolute inset-0 opacity-60 mix-blend-overlay" style={{
                background: `linear-gradient(135deg, ${colors[0]} 0%, transparent 50%, ${colors[2]} 50%, transparent 100%)`
              }} />
            </div>
          );

          return (
            <div
              key={`bg-${index}`}
              className="absolute inset-0 overflow-hidden"
              style={{
                opacity: isActive ? 0.75 : 0,
                zIndex: isActive ? 2 : 1,
                clipPath: isActive 
                  ? 'circle(150% at 50% 50%)' 
                  : 'circle(0% at 50% 50%)',
                transition: isActive
                  ? 'clip-path 1300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease-out'
                  : 'clip-path 0ms 1300ms, opacity 1000ms ease-out',
              }}
            >
              {/* Warp the color blocks using SVG displacement map for fluid irregular paint swirls */}
              <div 
                className="absolute inset-0 scale-[1.5]"
                style={{
                  filter: `url(#marble-filter-${index}) saturate(240%) contrast(190%) brightness(0.95) blur(1.5px)`,
                }}
              >
                {layoutStyle}
              </div>
            </div>
          );
        })}
        {/* Soft overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fffdfc]/55 via-[#fffdfc]/25 to-[#fffdfc]/65 z-10" />
      </div>
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
      <div className="absolute top-[120px] sm:top-[6vh] left-1/2 -translate-x-1/2 z-20 h-[50px] overflow-hidden text-center pointer-events-none w-full flex justify-center">
        <div className="relative w-full h-full">
          {items.map((officer, index) => {
            const offset = cardOffset(index, reelPosition, items.length);
            const absOffset = Math.abs(offset);
            if (absOffset > 2) return null;
            const opacity = Math.max(0, 1 - absOffset);
            const y = offset * 50;

            return (
              <div
                key={index}
                style={{
                  transform: `translate3d(0, calc(-50% + ${y}px), 0)`,
                  opacity: opacity,
                  top: '50%',
                  left: 0,
                  right: 0,
                }}
                className="absolute h-[50px] flex items-center justify-center whitespace-nowrap text-[18px] sm:text-[22px] tracking-wide"
              >
                <span className="font-semibold text-neutral-400 mr-2.5">{officer.role}</span>
                <span className="font-bold text-neutral-900">{officer.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <section
        data-testid="officer-stage"
        aria-label="Officer photo reel"
        className="absolute inset-x-0 top-[6vh] z-10 mx-auto h-[44vh] min-h-[340px] max-w-[1260px] touch-pan-y overflow-visible max-[768px]:top-[16vh] max-[768px]:h-[43vh] max-[768px]:min-h-[360px]"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
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

            // 3D coverflow specific values
            const rotateY = clamped * -16; // Slight rotation towards the center
            const translateZ = -Math.abs(clamped) * 60; // Push non-active cards back in Z-space

            return (
              <div
                key={`${officer.name}-${index}`}
                className="absolute aspect-square select-none"
                style={{
                  width,
                  zIndex,
                  opacity,
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${clamped.toFixed(4)} * clamp(var(--min-card-step, 48px), 12.5vw, 190px)), calc(-50% + ${y}px), ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  filter: `grayscale(${Math.min(1, absOffset * 0.45).toFixed(2)}) brightness(${Math.max(0.65, 1 - absOffset * 0.15).toFixed(2)})`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <button
                  type="button"
                  data-testid="officer-card"
                  data-reel-offset={absOffset.toFixed(4)}
                  data-reel-signed-offset={signedSlot.toFixed(4)}
                  data-reel-scale={scale.toFixed(4)}
                  data-slot={absSlot}
                  className={`group w-full h-full overflow-hidden bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-black relative transition-all duration-500 ease-out ${
                    isActive
                      ? 'rounded-xl border-2 border-[#b89a5a] shadow-[0_15px_35px_rgba(184,154,90,0.28)]'
                      : 'rounded-lg border border-neutral-200/30 shadow-md'
                  }`}
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
                </button>

                {/* Role text below the photo card */}
                <div
                  className={`absolute left-0 right-0 top-[calc(100%+14px)] flex justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                  }`}
                >
                  <span className="bg-[#f5eed9]/90 px-3.5 py-1 rounded-full border border-[#b89a5a]/30 text-[#8a6f2f] text-[clamp(13px,1.4vw,17px)] font-bold font-ko tracking-widest shadow-[0_2px_8px_rgba(184,154,90,0.08)]">
                    {officer.role}
                  </span>
                </div>
              </div>
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
                className="absolute block rounded-full border border-[#b89a5a]/25"
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
        <h2 className="text-[28px] sm:text-[38px] font-bold text-neutral-800 tracking-wider font-ko">
          섬김의 손길들
        </h2>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-0 right-0 z-0 overflow-hidden opacity-[0.035]">
        <div className="flex min-w-[200%] animate-none whitespace-nowrap font-en text-[80px] font-bold uppercase leading-none tracking-normal max-[768px]:text-[52px]" style={{ animation: 'officer-marquee 20s linear infinite' }}>
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

      {/* SVG Filter for Fluid Marble / Paint Swirls - Rendered dynamically for each index with a unique seed */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {items.map((_, index) => (
            <filter key={index} id={`marble-filter-${index}`} colorInterpolationFilters="sRGB">
              {/* Vary the seed and frequency slightly to create completely distinct abstract wave patterns */}
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency={index % 2 === 0 ? "0.0045" : "0.0055"} 
                numOctaves="4" 
                seed={(index + 1) * 23} 
                result="noise" 
              />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale={index % 2 === 0 ? "340" : "370"} 
                xChannelSelector="R" 
                yChannelSelector="G" 
              />
            </filter>
          ))}
        </defs>
      </svg>
    </main>
  );
}
