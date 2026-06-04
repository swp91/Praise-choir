'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { imageUrl } from '@/lib/media';
import type { Officer } from '@/lib/types';

// Mapped duties for officers based on roles
const dutiesMap: Record<string, string> = {
  '대장': '찬양대 운영 전반을 총괄하며 찬양대의 방향성 제시, 대원 자질 향상 및 부서간 가교 역할을 조율합니다.',
  '총무': '행정 및 운영 실무를 총괄하며 대원 출결 관리, 절기 행사 기획, 물품 관리 및 전반적인 살림을 집행합니다.',
  '서기': '출석 통계 및 행정 문서 관리를 담당하며 주간 보고서 작성, 회의록 보존 및 제반 문서 행정을 기록 보존합니다.',
  '회계': '찬양대 재정 관리 및 예산·결산을 수행하며 매월 회계 정산 및 보고, 투명한 절차의 지출 증빙을 집행합니다.',
  '자막': '예배 찬양 시 가사 자막을 제작 및 송출하며, 디지털 기기 관리와 원활한 예배 영상 지원을 보조합니다.',
  '파트장': '해당 파트의 목소리 밸런스 튜닝을 조율하고 파트원 연락망 가동, 출결 독려 및 파트 친목과 화합을 도모합니다.',
};

const getDuties = (role: string) => {
  if (dutiesMap[role]) return dutiesMap[role];
  if (role.includes('파트장')) return dutiesMap['파트장'];
  return '찬양대 임원단으로서 예배 찬양을 돕고 찬양대원 관리 및 행정 제반 업무를 협력하여 수행합니다.';
};

interface LeadersGalleryClientProps {
  officers: Officer[];
}

export default function LeadersGalleryClient({ officers }: LeadersGalleryClientProps) {
  const [rotationY, setRotationY] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState('transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)');

  const viewportRef = useRef<HTMLDivElement>(null);
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
      currentRotationRef.current += diff * 0.07;
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
      targetRotationRef.current += e.deltaY * 0.09;
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
        targetRotationRef.current += deltaX * 0.22;
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
    ? Math.max(260, (totalCards * 110) / (2 * Math.PI)) 
    : Math.max(530, (totalCards * 200) / (2 * Math.PI));

  // camera is inside the cylinder, Z = 1000px
  const cameraZ = 1000;
  const viewDistance = isMobile ? 320 : 550;
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
      `}</style>

      {/* Floating Header */}
      <div className="absolute top-10 left-0 right-0 z-20 flex flex-col items-center pointer-events-none text-center px-6">
        <span className="font-en text-[11px] uppercase tracking-[0.3em] text-gold-deep mb-1.5">Serving Servants</span>
        <h1 className="font-ko text-[22px] font-bold text-ink tracking-wide">찬양대 임원진</h1>
        <div className="w-12 h-[1.5px] bg-gold/40 mt-2.5" />
      </div>

      {/* Floating Home Back Button */}
      <div className="fixed top-8 left-8 z-30 max-[880px]:top-6 max-[880px]:left-6">
        <Link href="/" className="font-ko text-[12px] font-medium tracking-wide text-ink hover:text-gold transition-colors duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-soft bg-[#fdf9f0]/60 backdrop-blur-sm shadow-sm">
          <span>←</span> 홈으로
        </Link>
      </div>

      {/* Visual instructions */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 transition-opacity duration-500 pointer-events-none ${activeIdx !== null ? 'opacity-0' : 'opacity-70'}`}>
        <span className="font-en text-[10px] uppercase tracking-[0.25em] text-gold-deep">Scroll to Rotate</span>
        <div className="w-[1px] h-6 bg-gold-deep/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gold-deep animate-[bounce_2s_infinite]" />
        </div>
      </div>

      {/* 3D Visual Gallery Page Container */}
      <div 
        ref={viewportRef}
        onTouchStart={handleTouchStart}
        className="viewport-3d w-full h-full flex items-center justify-center relative"
      >
        {/* 3D Cylinder Container */}
        <div 
          className="cylinder-container relative w-full h-[50vh] flex items-center justify-center transition-all"
          style={{ 
            transform: `translateZ(${cylinderZ.toFixed(2)}px) rotateY(${rotationY.toFixed(4)}deg)`,
            transition: transitionStyle
          }}
        >
          {officers.map((officer, i) => {
            const angle = i * (360 / totalCards);
            const isActive = activeIdx === i;
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

            const offsetY = isAnyActive ? 0 : seedY * 40;
            const rotateX = isAnyActive ? 0 : seedX * 12; // tilt forward/backward
            const rotateYOffset = isAnyActive ? 0 : seedRotY * 10; // yaw tilt
            const rotateZ = isAnyActive ? 0 : seedZ * 8; // roll tilt
            
            // Focus card details
            const focusAdvance = isMobile ? 80 : 180;
            const translateZVal = isActive ? -(radius - focusAdvance) : -radius;
            const scale = isActive ? 1.2 : (isAnyActive ? 0.8 : 1);

            // WebGL-like depth fade effects using cosAngle
            // Front-facing cards are clear and opaque, back-facing cards fade
            const normalOpacity = Math.max(0.12, (cosAngle + 1) / 2);
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
                onClick={() => handleCardClick(i)}
                className={`officer-card-3d absolute w-[160px] h-[213px] max-[768px]:w-[90px] max-[768px]:h-[120px] bg-card border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-sm overflow-hidden shadow-lg cursor-pointer ${
                  isActive 
                    ? 'border-gold shadow-[0_15px_45px_rgba(184,154,90,0.5)]' 
                    : 'border-line/40 hover:border-gold shadow-black/8 hover:shadow-[0_12px_28px_rgba(138,111,47,0.18)]'
                }`}
                style={{
                  transform: transformStr,
                  opacity: opacityVal,
                  zIndex: zIndex,
                  pointerEvents: pointerEvents,
                  left: `calc(50% - ${cardWidth / 2}px)`,
                  top: `calc(50% - ${cardHeight / 2}px)`,
                }}
              >
                <div className="w-full h-full relative">
                  {officer.photo ? (
                    <Image 
                      src={imageUrl(officer.photo, { width: 320, height: 426, crop: 'fill', gravity: 'face' })} 
                      alt={officer.name} 
                      fill 
                      priority={isInitiallyVisible}
                      sizes="(max-width: 768px) 180px, 320px" 
                      className="object-cover transition-transform duration-500 hover:scale-105"
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
            className="fixed inset-0 bg-black/15 z-40 transition-opacity duration-700 cursor-pointer"
            onClick={handleClose}
          />
        )}

        {/* Details Information Panel */}
        <div 
          className={`fixed top-0 bottom-0 right-0 z-50 w-[420px] max-w-full bg-[#fdf9f0]/95 backdrop-blur-md border-l border-line shadow-[0_0_50px_rgba(42,38,32,0.15)] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeIdx !== null ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {activeOfficer && (
            <div className="w-full h-full flex flex-col p-10 max-[768px]:p-6 overflow-y-auto">
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="self-end w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink hover:text-gold hover:border-gold transition-colors duration-300 mb-6 font-en text-[14px]"
                aria-label="Close Details"
              >
                ✕
              </button>

              {/* Detail Photo Frame */}
              <div className="w-full aspect-[3/4] relative rounded-lg overflow-hidden border-2 border-gold shadow-md bg-card mb-8">
                {activeOfficer.photo ? (
                  <Image 
                    src={imageUrl(activeOfficer.photo, { width: 600, height: 800, crop: 'fill', gravity: 'face' })} 
                    alt={activeOfficer.name} 
                    fill 
                    priority
                    sizes="400px" 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ebe0c4_0_10px,#ddd0ad_10px_20px)] flex items-center justify-center">
                    <span className="font-en text-[50px] text-ink-soft opacity-30">PRAISE</span>
                  </div>
                )}
              </div>

              {/* Metadata Names */}
              <div className="border-b border-line-soft pb-4 mb-6">
                <span className="font-en text-[11px] uppercase tracking-[0.2em] text-gold-deep font-semibold block mb-1">Choir Officer</span>
                <h2 className="font-ko text-[26px] font-bold text-ink leading-tight flex items-baseline gap-3">
                  {activeOfficer.name}
                  <span className="font-ko text-[14px] text-ink-soft font-normal">{activeOfficer.role}</span>
                </h2>
              </div>

              {/* Detailed Specs */}
              <div className="flex flex-col gap-5">
                {/* Part Section */}
                <div className="flex flex-col">
                  <span className="font-en text-[10px] uppercase tracking-[0.15em] text-ink-mute mb-1">소속 파트</span>
                  <span className="font-ko text-[14px] text-ink font-medium">
                    {activeOfficer.part ? `${activeOfficer.part} 파트` : '행정 지원'}
                  </span>
                </div>

                {/* Duties Section */}
                <div className="flex flex-col">
                  <span className="font-en text-[10px] uppercase tracking-[0.15em] text-ink-mute mb-1.5">상세 직무</span>
                  <p className="font-ko text-[13.5px] leading-relaxed text-ink-soft bg-card/40 p-4 rounded border border-line-soft">
                    {getDuties(activeOfficer.role)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
