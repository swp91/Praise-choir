'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { imageUrl } from '@/lib/media';
import type { Officer } from '@/lib/types';
import HeroBlock from '@/components/HeroBlock';

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
  const [scrollY, setScrollY] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState('transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor screen size for mobile responsive parameters
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update scroll position when not focusing an item
  useEffect(() => {
    if (activeIdx !== null) return;
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIdx]);

  // Handle click on card
  const handleCardClick = (index: number) => {
    if (activeIdx === index) {
      handleClose();
      return;
    }
    setTransitionStyle('transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)');
    setActiveIdx(index);
  };

  // Close details panel
  const handleClose = () => {
    setTransitionStyle('transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)');
    setActiveIdx(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTransitionStyle('transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1)');
    }, 800);
  };

  // Prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const totalCards = officers.length;
  // Calculate dynamic radius to prevent card overlap
  const radius = isMobile 
    ? Math.max(170, (totalCards * 110) / (2 * Math.PI)) 
    : Math.max(340, (totalCards * 190) / (2 * Math.PI));

  // Determine standard cylinder rotation
  const currentRotation = scrollY * 0.07;
  const targetRotation = activeIdx !== null 
    ? -(activeIdx * (360 / totalCards)) 
    : currentRotation;

  // Parallax cylinder position based on initial scroll
  const cylinderTranslateY = activeIdx !== null 
    ? 0 
    : Math.max(0, 160 - (scrollY * 0.5));

  const activeOfficer = activeIdx !== null ? officers[activeIdx] : null;

  return (
    <main className="main-content p-0 min-h-[350vh] bg-[#fdf9f0] relative select-none">
      {/* Scroll indicator instructions */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 transition-opacity duration-500 pointer-events-none ${scrollY > 200 || activeIdx !== null ? 'opacity-0' : 'opacity-80'}`}>
        <span className="font-en text-[10px] uppercase tracking-[0.25em] text-gold-deep">Scroll to Rotate</span>
        <div className="w-[1px] h-8 bg-gold-deep/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gold-deep animate-[bounce_2s_infinite]" />
        </div>
      </div>

      {/* Floating Home Back Button */}
      <div className="fixed top-8 left-8 z-30 max-[880px]:top-6 max-[880px]:left-6">
        <Link href="/" className="font-ko text-[12px] font-medium tracking-wide text-ink hover:text-gold transition-colors duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line-soft bg-[#fdf9f0]/60 backdrop-blur-sm shadow-sm">
          <span>←</span> 홈으로
        </Link>
      </div>

      {/* 3D Visual Gallery Page Container */}
      <div className="fixed inset-0 overflow-hidden w-full h-full flex flex-col items-center justify-center">
        {/* Parallax Hero Header */}
        <div 
          className="absolute left-0 right-0 top-0 z-10 transition-transform pointer-events-none"
          style={{ transform: activeIdx !== null ? 'translateY(-120%)' : `translateY(${-scrollY * 0.9}px)` }}
        >
          <HeroBlock
            eyebrow="Serving Servants"
            title="Choir Officers"
            titleKo="찬양대 임원진"
            watermark="OFFICER"
          />
        </div>

        {/* 3D Viewport Area */}
        <div 
          className="w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ 
            perspective: '1200px',
            transform: `translateY(${cylinderTranslateY}px)`
          }}
        >
          {/* Cylinder Container */}
          <div 
            className="relative w-full h-[50vh] flex items-center justify-center"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `rotateY(${targetRotation}deg) rotateX(-2deg)`,
              transition: transitionStyle
            }}
          >
            {officers.map((officer, i) => {
              const angle = i * (360 / totalCards);
              const isActive = activeIdx === i;
              const isAnyActive = activeIdx !== null;
              
              // Compute deterministic scattered values
              const seedY = Math.sin(i * 1.7);
              const seedRotate = Math.sin(i * 3.1);
              const offsetY = isAnyActive ? 0 : seedY * 42;
              const rotateZ = isAnyActive ? 0 : seedRotate * 7;
              
              // Scale and translate on focus
              const translateZ = isActive ? radius + 110 : radius;
              const scale = isActive ? 1.15 : (isAnyActive ? 0.85 : 1);
              const opacity = isAnyActive && !isActive ? 0.22 : 1;

              return (
                <div
                  key={i}
                  onClick={() => handleCardClick(i)}
                  className={`absolute w-[180px] h-[242px] max-[768px]:w-[102px] max-[768px]:h-[138px] bg-card border-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-md overflow-hidden shadow-md cursor-pointer flex flex-col p-2.5 max-[768px]:p-1.5 ${
                    isActive 
                      ? 'border-gold shadow-[0_10px_35px_rgba(184,154,90,0.4)] z-30' 
                      : 'border-line hover:border-gold-deep shadow-black/5 hover:shadow-[0_8px_20px_rgba(138,111,47,0.15)] z-20'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${angle}deg) translateZ(${translateZ}px) translateY(${offsetY}px) rotateZ(${rotateZ}deg) scale(${scale})`,
                    opacity: opacity,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Photo Frame Container */}
                  <div className="w-full flex-1 relative rounded overflow-hidden bg-card-head border border-line-soft">
                    {officer.photo ? (
                      <Image 
                        src={imageUrl(officer.photo, { width: 384, height: 512, crop: 'fill', gravity: 'face' })} 
                        alt={officer.name} 
                        fill 
                        sizes="(max-width: 768px) 100px, 200px" 
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ebe0c4_0_5px,#ddd0ad_5px_10px)] flex items-center justify-center">
                        <span className="font-en text-[24px] max-[768px]:text-[16px] text-ink-soft opacity-30">P</span>
                      </div>
                    )}
                  </div>

                  {/* Card Meta details */}
                  <div className="pt-2 pb-0.5 text-center flex flex-col justify-center">
                    <span className="font-ko text-[13px] max-[768px]:text-[11px] font-bold text-ink leading-tight">{officer.name}</span>
                    <span className="font-ko text-[10.5px] max-[768px]:text-[8.5px] text-gold-deep mt-0.5 tracking-wide">{officer.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
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
