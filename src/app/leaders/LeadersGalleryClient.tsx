'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { imageUrl } from '@/lib/media';
import type { Officer } from '@/lib/types';

interface LeadersGalleryClientProps {
  officers: Officer[];
}

export default function LeadersGalleryClient({ officers }: LeadersGalleryClientProps) {
  const [rotationY, setRotationY] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
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
      if (activeIdx !== null) return;
      e.preventDefault();
      // Mouse wheel directly adjusts target rotation infinitely
      targetRotationRef.current += e.deltaY * 0.065;
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [activeIdx]);

  // Global touch drag/swipe events for infinite scrolling on mobile
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || activeIdx !== null) return;
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
        targetRotationRef.current += deltaX * 0.16;
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
  }, [activeIdx]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeIdx !== null) return;
    isDraggingRef.current = true;
    const clientX = e.touches[0].clientX;
    startXRef.current = clientX;
    dragStartRef.current = {
      x: clientX,
      y: e.touches[0].clientY,
      hasMoved: false,
    };
  };

  // Click card focuses on that officer via shortest-path algorithm
  const handleCardClick = (index: number) => {
    // If we were dragging (e.g. on mobile touch), ignore the click
    if (dragStartRef.current.hasMoved) {
      return;
    }

    if (activeIdx === index) {
      handleClose();
      return;
    }
    
    // Shortest-path rotation mapping
    const totalCards = officers.length;
    const targetAngle = -(index * (360 / totalCards));
    const currentRot = currentRotationRef.current;
    
    let diff = (targetAngle - currentRot) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    
    setTransitionStyle('transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)');
    targetRotationRef.current = currentRot + diff;
    setActiveIdx(index);
  };

  const getCardAtPoint = (clientX: number, clientY: number) => {
    return cardRefs.current
      .map((element, index) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const photoStyle = element.firstElementChild
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
          Number(photoStyle?.opacity ?? '1') < 0.2
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
    if (activeIdx !== null || dragStartRef.current.hasMoved) return;

    const clickedCard = getCardAtPoint(e.clientX, e.clientY);

    if (clickedCard) {
      handleCardClick(clickedCard.index);
    }
  };

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeIdx !== null || dragStartRef.current.hasMoved) {
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

  const handleClose = () => {
    setTransitionStyle('transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)');
    setActiveIdx(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTransitionStyle('transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)');
    }, 800);
  };

  const totalCards = officers.length;
  // Calculate dynamic radius to prevent card overlap and match wide perspective
  const radius = isMobile 
    ? Math.max(205, (totalCards * 100) / (2 * Math.PI)) 
    : Math.max(405, (totalCards * 145) / (2 * Math.PI));

  // Camera sits inside the cylinder; lower perspective values make depth more visible.
  const cameraZ = isMobile ? 760 : 900;
  const viewDistance = isMobile ? 295 : 500;
  // cylinder center is translated forward in Z to place the camera inside
  const cylinderZ = cameraZ + radius - viewDistance;

  const cardWidth = isMobile ? 90 : 160;
  const cardHeight = isMobile ? 120 : 213;

  const activeOfficer = activeIdx !== null ? officers[activeIdx] : null;

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
        .officer-card-3d {
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
              MANUS MINISTRANTES
            </span>
          ))}
        </div>
      </div>

      {/* Floating Header */}
      <div className="absolute top-10 left-0 right-0 z-20 flex flex-col items-center pointer-events-none text-center px-6">
        <span className="font-en text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-1.5">Choir Officers</span>
        <h1 className="font-ko text-[30px] font-bold text-ink tracking-wide max-[768px]:text-[25px]">섬기는 손길들</h1>
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
          className="cylinder-container relative z-30 w-full h-[50vh] flex items-center justify-center transition-all"
          style={{ 
            transform: `translateZ(${cylinderZ.toFixed(2)}px) rotateY(${rotationY.toFixed(4)}deg)`,
            transition: transitionStyle
          }}
        >
          {officers.map((officer, i) => {
            const angle = i * (360 / totalCards);
            const isActive = activeIdx === i;
            const isHovered = hoveredIdx === i && activeIdx === null;
            const isAnyActive = activeIdx !== null;
            
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
            const offsetY = isAnyActive ? 0 : seedY * 22;
            const rotateX = isAnyActive ? 0 : seedX * 5; // tilt forward/backward
            const rotateYOffset = isAnyActive ? 0 : (seedRotY * 4) - (Math.sin(rad) * 16); // subtly face the camera
            const rotateZ = isAnyActive ? 0 : seedZ * 3; // roll tilt
            
            // Focus card details
            const focusAdvance = isMobile ? 80 : 180;
            const depthAdvance = isMobile ? frontness * 45 : frontness * 70;
            const depthRetreat = isMobile ? sideDepth * 14 : sideDepth * 24;
            const translateZVal = isActive ? -(radius - focusAdvance) : -(radius - depthAdvance + depthRetreat);
            const scale = isActive ? 1.12 : (isAnyActive ? 0.62 : 0.7 + frontness * 0.22);

            // WebGL-like depth fade effects using cosAngle
            // Front-facing cards are clear and opaque, back-facing cards fade
            const normalOpacity = Math.max(0.1, 0.2 + frontness * 0.8);
            const opacity = isAnyActive ? (isActive ? 1 : 0.15) : normalOpacity;

            // Sort cards in 3D layering space
            const zIndex = isActive ? 50 : Math.round((cosAngle + 1) * 100);

            // Check if card is in the front half of the cylinder
            const pointerEvents = cosAngle > 0.1 && (!isAnyActive || isActive) ? 'auto' : 'none';

            // Formatted values to prevent SSR/Hydration mismatch from floating point precision
            const transformStr = `rotateY(${angle.toFixed(2)}deg) translateZ(${translateZVal.toFixed(2)}px) rotateY(${rotateYOffset.toFixed(4)}deg) rotateX(${rotateX.toFixed(4)}deg) rotateZ(${rotateZ.toFixed(4)}deg) translateY(${offsetY.toFixed(2)}px) scale(${scale.toFixed(4)})`;
            const opacityVal = parseFloat(opacity.toFixed(4));

            // Selectively preload only front-facing cards initially visible to user
            const isInitiallyVisible = i < 3 || i > totalCards - 4;

            return (
              <div
                key={i}
                ref={(element) => {
                  cardRefs.current[i] = element;
                }}
                data-hovered={isHovered ? 'true' : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  handleCardClick(i);
                }}
                className="officer-card-3d absolute w-[160px] h-[213px] max-[768px]:w-[90px] max-[768px]:h-[120px] cursor-pointer"
                style={{
                  transform: transformStr,
                  zIndex: zIndex,
                  pointerEvents: pointerEvents,
                  left: `calc(50% - ${cardWidth / 2}px)`,
                  top: `calc(50% - ${cardHeight / 2}px)`,
                }}
              >
                <div 
                  className={`w-full h-full relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-sm overflow-hidden border shadow-lg ${
                    isActive 
                      ? 'border-gold shadow-[0_15px_45px_rgba(184,154,90,0.5)] bg-card' 
                      : isHovered
                        ? 'border-gold shadow-[0_12px_28px_rgba(138,111,47,0.18)] bg-card'
                        : 'border-line/40 hover:border-gold shadow-black/8 hover:shadow-[0_12px_28px_rgba(138,111,47,0.18)] bg-card'
                  }`}
                  style={{ opacity: opacityVal }}
                >
                  {officer.photo ? (
                    <Image 
                      src={imageUrl(officer.photo, { width: 320, height: 426, crop: 'fill', gravity: 'face' })} 
                      alt={officer.name} 
                      fill 
                      priority={isInitiallyVisible}
                      sizes="(max-width: 768px) 180px, 320px" 
                      className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : 'hover:scale-105'}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ebe0c4_0_5px,#ddd0ad_5px_10px)] flex items-center justify-center">
                      <span className="font-en text-[28px] max-[768px]:text-[18px] text-ink-soft opacity-30">P</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Faded Background Mask Overlay */}
        {activeIdx !== null && (
          <div 
            className="fixed inset-0 z-20 cursor-pointer bg-[#fdf9f0]/45 transition-opacity duration-700"
            onClick={handleClose}
          />
        )}

        {activeOfficer && (
          <div className="pointer-events-none fixed left-[calc(50%+150px)] top-1/2 z-40 flex -translate-y-1/2 flex-col items-start max-[768px]:left-1/2 max-[768px]:top-[72%] max-[768px]:-translate-x-1/2 max-[768px]:items-center">
            <span className="font-en text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-deep/80">
              Choir Officer
            </span>
            <div className="mt-3 h-px w-16 bg-gold/50 max-[768px]:w-12" />
            <div className="mt-5 flex flex-col items-start whitespace-nowrap max-[768px]:items-center">
              <span className="font-ko text-[23px] font-semibold text-gold-deep max-[768px]:text-[17px]">
                {activeOfficer.role}
              </span>
              <span className="mt-2 font-ko text-[46px] font-bold leading-none tracking-wide text-ink max-[768px]:text-[30px]">
                {activeOfficer.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
