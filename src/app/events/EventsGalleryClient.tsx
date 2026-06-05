'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { ChoirEvent } from '@/lib/types';

interface EventsGalleryClientProps {
  scheduleYear: number;
  reportYear: number;
  scheduleEvents: ChoirEvent[];
  reportEvents: ChoirEvent[];
}

export default function EventsGalleryClient({
  scheduleYear,
  reportYear,
  scheduleEvents,
  reportEvents,
}: EventsGalleryClientProps) {
  const [activeYear, setActiveYear] = useState<number>(scheduleYear);
  const [needleYear, setNeedleYear] = useState<number>(scheduleYear);
  const [isFading, setIsFading] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState('transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)');

  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag and Swipe Tracking Refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0, hasMoved: false });

  // Get active list of events based on year
  const currentEvents = useMemo(() => {
    return activeYear === scheduleYear ? scheduleEvents : reportEvents;
  }, [activeYear, scheduleYear, scheduleEvents, reportEvents]);

  // Monitor screen size for mobile responsive parameters
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // RequestAnimationFrame smooth damping loop (Inertia Engine)
  useEffect(() => {
    const animate = () => {
      const diff = targetRotationRef.current - currentRotationRef.current;
      // Smoothly damp current rotation towards target rotation
      currentRotationRef.current += diff * 0.055;
      setRotationY(currentRotationRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Custom infinite scroll/wheel listener
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Mouse wheel directly adjusts target rotation infinitely
      targetRotationRef.current += e.deltaY * 0.065;
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Global touch drag/swipe events for infinite scrolling on mobile
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const dx = currentX - dragStartRef.current.x;
      const dy = currentY - dragStartRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!dragStartRef.current.hasMoved && dist > 6) {
        dragStartRef.current.hasMoved = true;
      }

      if (dragStartRef.current.hasMoved) {
        const deltaX = currentX - startXRef.current;
        targetRotationRef.current += deltaX * 0.38;
        startXRef.current = currentX;
      }
    };

    const handleGlobalTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    const clientX = e.touches[0].clientX;
    startXRef.current = clientX;
    dragStartRef.current = {
      x: clientX,
      y: e.touches[0].clientY,
      hasMoved: false,
    };
  };

  // Click card rotates that card to focus
  const handleCardClick = (index: number) => {
    // If we were dragging (e.g. on mobile touch), ignore the click
    if (dragStartRef.current.hasMoved) return;

    const totalCards = currentEvents.length;
    if (totalCards === 0) return;

    const targetAngle = -(index * (360 / totalCards));
    const currentRot = currentRotationRef.current;
    
    let diff = (targetAngle - currentRot) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    
    setTransitionStyle('transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)');
    targetRotationRef.current = currentRot + diff;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTransitionStyle('transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)');
    }, 800);
  };

  const getCardAtPoint = (clientX: number, clientY: number) => {
    return cardRefs.current
      .map((element, index) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const textElement = element.firstElementChild
          ? window.getComputedStyle(element.firstElementChild)
          : null;
        const isUnderPointer =
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom;

        if (
          !isUnderPointer ||
          style.pointerEvents === 'none' ||
          Number(textElement?.opacity ?? '1') < 0.2
        ) {
          return null;
        }

        return {
          index,
          zIndex: Number(style.zIndex) || 0,
        };
      })
      .filter((item): item is { index: number; zIndex: number } => item !== null)
      .sort((a, b) => b.zIndex - a.zIndex)[0];
  };

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartRef.current.hasMoved) return;
    const clickedCard = getCardAtPoint(e.clientX, e.clientY);
    if (clickedCard) {
      handleCardClick(clickedCard.index);
    }
  };

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartRef.current.hasMoved) {
      if (hoveredIdx !== null) setHoveredIdx(null);
      return;
    }

    const hoveredCard = getCardAtPoint(e.clientX, e.clientY);
    const nextHoveredIdx = hoveredCard?.index ?? null;
    if (hoveredIdx !== nextHoveredIdx) {
      setHoveredIdx(nextHoveredIdx);
    }
  };

  const handleViewportMouseLeave = () => {
    setHoveredIdx(null);
  };

  // Switch active year with fading transition synchronized with needle rotation
  const handleYearToggle = (year: number) => {
    if (year === needleYear || isFading) return;
    
    // 1. Rotate needle immediately
    setNeedleYear(year);
    
    // 2. Start fading out cards after 350ms (when needle is rotating)
    setTimeout(() => {
      setIsFading(true);
    }, 350);

    // 3. Swap dataset and fade back in at 650ms (when needle arrives)
    setTimeout(() => {
      setActiveYear(year);
      // Reset rotation to front when swapping datasets
      targetRotationRef.current = 0;
      currentRotationRef.current = 0;
      setRotationY(0);
      setIsFading(false);
    }, 650);
  };

  const totalCards = currentEvents.length;

  // Calculate dynamic radius to prevent card overlap and match wide perspective
  // Using wider spacing for text-based cards (130 mobile, 240 desktop)
  const radius = isMobile 
    ? Math.max(200, (totalCards * 130) / (2 * Math.PI)) 
    : Math.max(400, (totalCards * 240) / (2 * Math.PI));

  // Cylinder positioning
  const cameraZ = isMobile ? 760 : 900;
  const viewDistance = isMobile ? 295 : 500;
  const cylinderZ = cameraZ + radius - viewDistance;

  const cardWidth = isMobile ? 160 : 270;
  const cardHeight = isMobile ? 120 : 180;

  return (
    <main className="main-content p-0 w-screen h-screen overflow-hidden bg-[#fdf9f0] relative select-none">
      {/* 3D viewport style injection */}
      <style jsx global>{`
        .viewport-3d {
          perspective: ${cameraZ}px;
          perspective-origin: 50% 50%;
        }
        .cylinder-container {
          transform-style: preserve-3d;
        }
        .event-card-3d {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .latin-watermark-track {
          animation: latin-watermark-slide 42s linear infinite;
        }
        @keyframes latin-watermark-slide {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>

      {/* Moving Latin watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center overflow-hidden opacity-[0.055]">
        <div className="latin-watermark-track flex min-w-[200%] whitespace-nowrap font-en text-[84px] font-semibold uppercase tracking-[0.18em] text-gold-deep italic max-[768px]:text-[46px]">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} className="mx-10">
              CALENDARIUM PRAISE
            </span>
          ))}
        </div>
      </div>

      {/* Floating Header */}
      <div className="absolute top-10 left-0 right-0 z-20 flex flex-col items-center pointer-events-none text-center px-6">
        <span className="font-en text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-1.5">Choir Calendar</span>
        <h1 className="font-ko text-[30px] font-bold text-ink tracking-wide max-[768px]:text-[25px]">
          {activeYear === scheduleYear ? `${scheduleYear} 일정` : `${reportYear} 활동 보고`}
        </h1>
        <div className="w-12 h-[1.5px] bg-gold/40 mt-2.5" />
      </div>

      {/* Floating Home Back Button */}
      <div className="fixed top-8 left-8 z-30 max-[880px]:top-6 max-[880px]:left-6">
        <Link href="/" className="font-ko text-[12px] font-medium tracking-wide text-ink hover:text-gold transition-colors duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-soft bg-[#fdf9f0]/60 backdrop-blur-sm shadow-sm">
          <span>←</span> 홈으로
        </Link>
      </div>

      {/* 3D Visual Gallery Page Container */}
      <div 
        ref={viewportRef}
        onTouchStart={handleTouchStart}
        onClick={handleViewportClick}
        onMouseMove={handleViewportMouseMove}
        onMouseLeave={handleViewportMouseLeave}
        className="viewport-3d relative z-10 w-full h-full flex items-center justify-center"
        style={{ cursor: hoveredIdx !== null ? 'pointer' : undefined }}
      >
        {/* 3D Cylinder Container */}
        <div 
          className={`cylinder-container relative z-30 w-full h-[50vh] flex items-center justify-center transition-all duration-300 ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={{ 
            transform: `translateZ(${cylinderZ.toFixed(2)}px) rotateY(${rotationY.toFixed(4)}deg)`,
            transition: isFading ? 'opacity 0.3s ease, transform 0.3s ease' : transitionStyle
          }}
        >
          {totalCards === 0 ? (
            /* Fallback card if empty */
            <div
              className="absolute w-[270px] h-[180px] flex flex-col items-center justify-center p-6 text-center"
              style={{
                left: `calc(50% - 135px)`,
                top: `calc(50% - 90px)`,
              }}
            >
              <span className="font-ko text-[15px] text-ink-soft">등록된 일정이 없습니다.</span>
            </div>
          ) : (
            currentEvents.map((event, i) => {
              const angle = i * (360 / totalCards);
              const isHovered = hoveredIdx === i;
              
              // Calculate relative angle in viewport space to apply depth effects
              const relativeAngle = ((angle + rotationY) % 360 + 360) % 360;
              const rad = (relativeAngle * Math.PI) / 180;
              const cosAngle = Math.cos(rad); // 1 = closest, -1 = furthest

              // Compute deterministic scattered offsets for scrolling mode
              const seedX = Math.sin(i * 2.3);
              const seedY = Math.cos(i * 1.7);
              const seedZ = Math.sin(i * 3.1);
              const seedRotY = Math.cos(i * 4.7);

              const frontness = Math.max(0, cosAngle);
              const sideDepth = 1 - Math.abs(cosAngle);
              
              const offsetY = seedY * 16;
              const rotateX = seedX * 4;
              const rotateYOffset = (seedRotY * 3) - (Math.sin(rad) * 12);
              const rotateZ = seedZ * 2;
              
              const depthAdvance = isMobile ? frontness * 40 : frontness * 65;
              const depthRetreat = isMobile ? sideDepth * 12 : sideDepth * 20;
              const translateZVal = -(radius - depthAdvance + depthRetreat);
              const scale = 0.75 + frontness * 0.25;

              // WebGL-like depth fade effects using cosAngle
              const opacity = Math.max(0.12, 0.2 + frontness * 0.8);
              const zIndex = Math.round((cosAngle + 1) * 100);

              // Check if card is in the front half of the cylinder
              const pointerEvents = cosAngle > 0.1 ? 'auto' : 'none';

              // Formatted values to prevent SSR/Hydration mismatch from floating point precision
              const transformStr = `rotateY(${angle.toFixed(2)}deg) translateZ(${translateZVal.toFixed(2)}px) rotateY(${rotateYOffset.toFixed(4)}deg) rotateX(${rotateX.toFixed(4)}deg) rotateZ(${rotateZ.toFixed(4)}deg) translateY(${offsetY.toFixed(2)}px) scale(${scale.toFixed(4)})`;
              const opacityVal = parseFloat(opacity.toFixed(4));

              return (
                <div
                  key={i}
                  ref={(element) => {
                    cardRefs.current[i] = element;
                  }}
                  data-hovered={isHovered ? 'true' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(i);
                  }}
                  className="event-card-3d absolute w-[270px] h-[180px] max-[768px]:w-[160px] max-[768px]:h-[120px] cursor-pointer"
                  style={{
                    transform: transformStr,
                    zIndex: zIndex,
                    pointerEvents: pointerEvents,
                    left: `calc(50% - ${cardWidth / 2}px)`,
                    top: `calc(50% - ${cardHeight / 2}px)`,
                  }}
                >
                  {/* Floating Text Design (No card borders/backgrounds) */}
                  <div 
                    className="w-full h-full p-4 flex flex-col justify-center items-center text-center select-none"
                    style={{ opacity: opacityVal }}
                  >
                    <div className="flex flex-col gap-2 max-[768px]:gap-0.5 items-center">
                      {/* Date/When Tag */}
                      <span className="font-en text-[14px] max-[768px]:text-[11px] font-bold tracking-[0.15em] text-gold-deep">
                        {event.when}
                      </span>
                      {/* Title */}
                      <h3 className={`font-ko text-[21px] max-[768px]:text-[15px] font-bold tracking-wide leading-snug ${event.highlight ? 'text-gold-deep' : 'text-ink'}`}>
                        {event.title}
                      </h3>
                    </div>

                    {/* Details Description */}
                    {event.detail && (
                      <div className="font-ko text-[12px] max-[768px]:text-[10px] text-ink-soft leading-relaxed border-t border-gold/15 pt-2 max-[768px]:pt-1 mt-2.5 max-[768px]:mt-1.5 max-w-[85%] overflow-hidden text-ellipsis line-clamp-3 max-[768px]:line-clamp-2">
                        {event.detail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Dial Toggle (Clock/Needle style) at the bottom */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[240px] h-[90px] z-30 select-none">
          {/* Left Year Button (10 o'clock position) */}
          <button 
            type="button"
            onClick={() => handleYearToggle(scheduleYear)} 
            className={`absolute left-[15px] top-[12px] cursor-pointer bg-transparent border-0 p-0 outline-none select-none transition-all duration-500 ${needleYear === scheduleYear ? 'text-gold-deep scale-110 font-bold' : 'text-ink-soft opacity-40 hover:opacity-100'}`}
          >
            <span className="font-en text-[22px] max-[768px]:text-[18px] font-bold tracking-wide leading-none">{scheduleYear}</span>
          </button>

          {/* Semicircle SVG Dial with Rotating Needle */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[160px] h-[80px] overflow-visible pointer-events-none select-none">
            <svg width="160" height="80" viewBox="0 0 160 80" className="overflow-visible">
              {/* Semicircle path representing the dial range */}
              <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#ebe0c4" strokeWidth="1.5" strokeDasharray="3,3" />
              
              {/* Pivot circles */}
              <circle cx="80" cy="80" r="4.5" fill="#8a6f2f" />
              <circle cx="80" cy="80" r="2" fill="#fdf9f0" />
              
              {/* Rotating pointer needle */}
              <line 
                x1="80" y1="80" 
                x2="80" y2="15" 
                stroke="#b89a5a" 
                strokeWidth="2.2" 
                strokeLinecap="round"
                style={{
                  transform: `rotate(${needleYear === scheduleYear ? -45 : 45}deg)`,
                  transformOrigin: '80px 80px',
                  transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </svg>
          </div>

          {/* Right Year Button (2 o'clock position) */}
          <button 
            type="button"
            onClick={() => handleYearToggle(reportYear)} 
            className={`absolute right-[15px] top-[12px] cursor-pointer bg-transparent border-0 p-0 outline-none select-none transition-all duration-500 ${needleYear === reportYear ? 'text-gold-deep scale-110 font-bold' : 'text-ink-soft opacity-40 hover:opacity-100'}`}
          >
            <span className="font-en text-[22px] max-[768px]:text-[18px] font-bold tracking-wide leading-none">{reportYear}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
