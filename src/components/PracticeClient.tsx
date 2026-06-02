'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PracticeSlot } from '@/lib/types';

type Props = {
  data: {
    year: number;
    themeKo: string;
    themeEn: string | null;
    goalTitleKo: string;
    practice: PracticeSlot[];
    goals: string[];
  };
};

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

const TAG_EN = { '예배': 'Service', '연습': 'Rehearsal' } as const;

function formatTime(time: string) {
  const m = time.match(/(오전|오후)\s*(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})/);
  if (!m) return time;
  const ampm = m[1] === '오전' ? 'AM' : 'PM';
  return `${m[2]} – ${m[3]} ${ampm}`;
}

// W_half 내에서 전체 1020px 너비의 콘텐츠 중 왼쪽 50%만 마스킹하여 렌더링
function MaskLeft({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="absolute left-0 top-0 w-[calc(100%+1px)] h-full overflow-hidden rounded-l-2xl bg-[#fbf7ec]"
      style={{
        borderTop: '1px solid rgba(212, 196, 160, 0.42)',
        borderBottom: '1px solid rgba(212, 196, 160, 0.42)',
        borderLeft: '1px solid rgba(212, 196, 160, 0.42)',
      }}
    >
      <div className="absolute left-0 top-0 w-[200%] h-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

// W_half 내에서 전체 1020px 너비의 콘텐츠 중 오른쪽 50%만 마스킹하여 렌더링
function MaskRight({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="absolute right-0 top-0 w-[calc(100%+1px)] h-full overflow-hidden rounded-r-2xl bg-[#fbf7ec]"
      style={{
        borderTop: '1px solid rgba(212, 196, 160, 0.42)',
        borderBottom: '1px solid rgba(212, 196, 160, 0.42)',
        borderRight: '1px solid rgba(212, 196, 160, 0.42)',
      }}
    >
      <div className="absolute left-[-100%] top-0 w-[200%] h-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

const cardVariants = {
  exit: (direction: 'next' | 'prev') => ({
    y: direction === 'next' ? -500 : 400,
    rotateX: direction === 'next' ? -65 : 25,
    rotateZ: direction === 'next' ? -8 : 4,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const }
  })
};

export default function PracticeClient({ data }: Props) {
  // 데스크톱: 0~3 (총 4개 스프레드 / 8개 페이지)
  const [activeSpread, setActiveSpread] = useState(0);
  const [prevSpread, setPrevSpread] = useState(0);
  const [targetSpread, setTargetSpread] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(1.25);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSpreads = 4;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (activeSpread !== targetSpread && !isTransitioning) {
      const distance = Math.abs(targetSpread - activeSpread);
      if (distance > 2) {
        setTransitionDuration(0.20); // 3페이지 이상 남았을 땐 급가속 (0.20초)
      } else if (distance > 1) {
        setTransitionDuration(0.40); // 2페이지 남았을 땐 빠른 가속 (0.40초)
      } else {
        setTransitionDuration(1.25); // 마지막 1페이지는 부드럽고 여유롭게 감속 안착 (1.25초)
      }

      const step = targetSpread > activeSpread ? 1 : -1;
      const nextSpread = activeSpread + step;
      setPrevSpread(activeSpread);
      setActiveSpread(nextSpread);
      setIsTransitioning(true);
    }
  }, [activeSpread, targetSpread, isTransitioning]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 모바일: 0~4 (총 5개 카드)
  const [mobileIndex, setMobileIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const totalCards = 5;

  const handleNext = () => {
    if (mobileIndex < totalCards - 1) {
      setDirection('next');
      setMobileIndex(mobileIndex + 1);
    }
  };

  const handlePrev = () => {
    if (mobileIndex > 0) {
      setDirection('prev');
      setMobileIndex(mobileIndex - 1);
    }
  };

  const handleDesktopSpreadChange = (nextSpread: number) => {
    if (nextSpread !== targetSpread) {
      setTargetSpread(nextSpread);
    }
  };

  // 일정 그룹화
  const morning = data.practice.filter((_, idx) => idx <= 2);
  const sortedMorning = [morning[1], morning[0], morning[2]].filter(Boolean);
  
  const evening = data.practice.filter((_, idx) => idx > 2);
  const sortedEvening = [evening[1], evening[0]].filter(Boolean);

  const renderGoalItem = (goal: string | undefined, index: number, showBorder = true) => {
    if (!goal) return null;
    const parts = goal.split(/(찬양을 통해)/);
    return (
      <div className={`flex gap-5 items-start py-4 ${showBorder ? 'border-b border-line-soft last:border-b-0' : ''}`}>
        <div className="font-en italic text-[24px] text-gold/80 leading-none font-medium mt-0.5">{toRoman(index + 1)}</div>
        <div className="font-ko text-[14px] leading-relaxed text-ink-soft">
          {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep">{p}</b> : p)}
        </div>
      </div>
    );
  };

  // ==========================================
  // [데스크톱 와이드 스프레드 선언]
  // ==========================================
  
  // Spread 0: 일정 (주일 오전 & 주일 저녁)
  const renderSpread0 = () => (
    <div className="w-[1020px] h-full flex select-none">
      <div className="w-1/2 h-full px-12 py-10 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Sunday Weekly Schedules
          </h3>
          <div className="flex flex-col gap-4">
            {sortedMorning.map((slot, i) => {
              const isWorship = slot.tag === '예배';
              return (
                <div key={i} className={`flex items-center justify-between gap-4 py-3 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep font-medium' : 'text-ink'}`}>
                  <div>
                    <span className={`inline-block font-en text-[8px] tracking-[0.14em] uppercase px-1.5 py-0.5 mb-1 ${isWorship ? 'text-gold-deep border border-gold/40 bg-gold/5' : 'text-ink-mute border border-line/40'}`}>
                      {TAG_EN[slot.tag]}
                    </span>
                    <div className="font-ko text-[13.5px] font-bold">{slot.label}</div>
                  </div>
                  <div className="font-en text-[13px] text-right shrink-0">
                    <span className="font-semibold block">{formatTime(slot.time)}</span>
                    <span className="font-ko text-[10px] text-ink-mute block mt-0.5">{slot.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-left mt-4 border-t border-line-soft pt-3">
          I / VIII · Morning Schedules
        </div>
      </div>
      
      <div className="w-1/2 h-full px-12 py-10 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Evening Schedules
          </h3>
          <div className="flex flex-col gap-4">
            {sortedEvening.map((slot, idx) => {
              const isWorship = slot.tag === '예배';
              return (
                <div key={idx} className={`flex items-center justify-between gap-4 py-3 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep font-medium' : 'text-ink'}`}>
                  <div>
                    <span className={`inline-block font-en text-[8px] tracking-[0.14em] uppercase px-1.5 py-0.5 mb-1 ${isWorship ? 'text-gold-deep border border-gold/40 bg-gold/5' : 'text-ink-mute border border-line/40'}`}>
                      {TAG_EN[slot.tag]}
                    </span>
                    <div className="font-ko text-[13.5px] font-bold">{slot.label}</div>
                  </div>
                  <div className="font-en text-[13px] text-right shrink-0">
                    <span className="font-semibold block">{formatTime(slot.time)}</span>
                    <span className="font-ko text-[10px] text-ink-mute block mt-0.5">{slot.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-right mt-4 border-t border-line-soft pt-3">
          II / VIII · Evening Schedules
        </div>
      </div>
    </div>
  );

  // Spread 1: 표어
  const renderSpread1 = () => (
    <div className="w-[1020px] h-full flex flex-col justify-between px-16 py-10 select-none">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <span className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold">
          {data.year} Congregation Motto
        </span>
        <span className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold">
          Praise Choir
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6">
        <p className="font-ko font-bold text-[clamp(28px,3.2vw,40px)] leading-snug text-ink tracking-[0.05em] whitespace-nowrap">
          {data.themeKo}
        </p>
        {data.themeEn && (
          <p className="font-en italic text-[15px] text-gold-deep/80 tracking-wider mt-5 max-w-[600px] border-t border-gold/20 pt-4 leading-relaxed">
            {data.themeEn}
          </p>
        )}
      </div>

      <div className="flex justify-between font-en text-[10px] text-ink-mute tracking-widest border-t border-line-soft pt-3">
        <span>III / VIII · Motto</span>
        <span>IV / VIII · Motto</span>
      </div>
    </div>
  );

  // Spread 2: 목표 1-4 (한 장으로 양옆으로 시원하게 이어지는 2x2 레이아웃)
  const renderSpread2 = () => (
    <div className="w-[1020px] h-full flex flex-col justify-between px-16 py-10 select-none">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          Annual Aims (I – IV)
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-x-16 gap-y-1 py-4 my-auto items-center">
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[0], 0, false)}
        </div>
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[1], 1, false)}
        </div>
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[2], 2, false)}
        </div>
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[3], 3, false)}
        </div>
      </div>

      <div className="flex justify-between font-en text-[10px] text-ink-mute tracking-widest border-t border-line-soft pt-3">
        <span>V / VIII · Aims</span>
        <span>VI / VIII · Aims</span>
      </div>
    </div>
  );

  // Spread 3: 목표 5-7 (한 장으로 이어지는 레이아웃)
  const renderSpread3 = () => (
    <div className="w-[1020px] h-full flex flex-col justify-between px-16 py-10 select-none">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          Annual Aims (V – VII)
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-x-16 gap-y-1 py-4 my-auto items-center">
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[4], 4, false)}
        </div>
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[5], 5, false)}
        </div>
        <div className="flex flex-col justify-center h-full">
          {renderGoalItem(data.goals[6], 6, false)}
        </div>
        <div className="flex items-center justify-center h-full opacity-30 select-none pointer-events-none">
          <span className="font-en italic text-[11px] text-gold-deep tracking-[0.2em] uppercase">Praise Choir</span>
        </div>
      </div>

      <div className="flex justify-between font-en text-[10px] text-ink-mute tracking-widest border-t border-line-soft pt-3">
        <span>VII / VIII · Aims</span>
        <span>VIII / VIII · Aims</span>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-cream px-0 pt-10 md:pt-14 pb-8 select-none">
      
      {/* 1. 백그라운드 라틴어 마키 연출 */}
      <div className="absolute top-8 left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
              HORAE · ORATIO
            </span>
          ))}
        </div>
      </div>

      {/* 2. 중앙 상단 타이틀 */}
      <div className="pointer-events-none relative z-20 mx-auto text-center shrink-0 mt-6 mb-8">
        <h1 className="font-en text-[clamp(32px,3.8vw,48px)] font-bold leading-none tracking-normal text-ink">
          Hours &amp; Aims
        </h1>
      </div>

      {/* ==========================================
          [데스크톱 뷰] min-width: 881px
         ========================================== */}
      <div className="hidden min-[881px]:flex flex-col items-center justify-center flex-1 w-full max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Book Wrapper (고정식 단일 묵직한 그림자 부여) */}
        <div className="relative w-full max-w-[1020px] h-[480px] flex items-center justify-center rounded-2xl shadow-[0_28px_90px_rgba(42,38,32,0.16)] bg-[#fbf7ec]">
          
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => handleDesktopSpreadChange(Math.max(0, activeSpread - 1))}
            disabled={activeSpread === 0 || isTransitioning}
            className="absolute -left-16 z-50 w-12 h-12 flex items-center justify-center rounded-full border border-line bg-card/85 text-ink shadow-md transition-all duration-300 hover:border-gold hover:text-gold-deep disabled:opacity-0 disabled:cursor-not-allowed"
            aria-label="이전 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleDesktopSpreadChange(Math.min(totalSpreads - 1, activeSpread + 1))}
            disabled={activeSpread === totalSpreads - 1 || isTransitioning}
            className="absolute -right-16 z-50 w-12 h-12 flex items-center justify-center rounded-full border border-line bg-card/85 text-ink shadow-md transition-all duration-300 hover:border-gold hover:text-gold-deep disabled:opacity-0 disabled:cursor-not-allowed"
            aria-label="다음 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Perspective Container */}
          <div className="relative w-full h-full" style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}>
            
            {/* Book Body (Background) - absolute 포지셔닝으로 Y축 정렬 맞춤 */}
            <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* [Page 1] Static Left Page (Schedules - Morning, Spread 0 Left) */}
              <div className="absolute left-0 top-0 w-1/2 h-full">
                <MaskLeft>{renderSpread0()}</MaskLeft>
              </div>

              {/* [Page 8] Static Right Page (Aims - Goals 5-7, Spread 3 Right) */}
              <div className="absolute right-0 top-0 w-1/2 h-full">
                <MaskRight>{renderSpread3()}</MaskRight>
              </div>

              {/* ==========================================
                  3D Flipping Page Sheets
                 ========================================== */}

              {/* [Sheet 0] Pages 2 (Spread 0 Right) & 3 (Spread 1 Left) */}
              {(() => {
                const i = 0;
                const isFlipped = activeSpread > i;
                const isFlipping = isTransitioning && Math.min(prevSpread, activeSpread) === i;
                
                let zIndex = isFlipped ? 10 + i : 30 - i;
                if (isFlipping) zIndex = 40;

                return (
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full cursor-pointer select-none"
                    style={{
                      transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left center',
                      transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1)`,
                      zIndex: zIndex,
                    }}
                    onClick={() => handleDesktopSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 0 Right (Evening Schedules) */}
                    <div 
                      className="absolute inset-0 bg-[#fbf7ec]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskRight>{renderSpread0()}</MaskRight>
                    </div>

                    {/* Back: Spread 1 Left (Motto Left) */}
                    <div 
                      className="absolute inset-0 bg-[#fbf7ec]"
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskLeft>{renderSpread1()}</MaskLeft>
                    </div>
                  </div>
                );
              })()}

              {/* [Sheet 1] Pages 4 (Spread 1 Right) & 5 (Spread 2 Left) */}
              {(() => {
                const i = 1;
                const isFlipped = activeSpread > i;
                const isFlipping = isTransitioning && Math.min(prevSpread, activeSpread) === i;
                
                let zIndex = isFlipped ? 10 + i : 30 - i;
                if (isFlipping) zIndex = 40;

                return (
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full cursor-pointer select-none"
                    style={{
                      transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left center',
                      transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1)`,
                      zIndex: zIndex,
                    }}
                    onClick={() => handleDesktopSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 1 Right (Motto Right) */}
                    <div 
                      className="absolute inset-0 bg-[#fbf7ec]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskRight>{renderSpread1()}</MaskRight>
                    </div>

                    {/* Back: Spread 2 Left (Goals 1-4 Left) */}
                    <div 
                      className="absolute inset-0 bg-[#fbf7ec]"
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskLeft>{renderSpread2()}</MaskLeft>
                    </div>
                  </div>
                );
              })()}

              {/* [Sheet 2] Pages 6 (Spread 2 Right) & 7 (Spread 3 Left) */}
              {(() => {
                const i = 2;
                const isFlipped = activeSpread > i;
                const isFlipping = isTransitioning && Math.min(prevSpread, activeSpread) === i;
                
                let zIndex = isFlipped ? 10 + i : 30 - i;
                if (isFlipping) zIndex = 40;

                return (
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full cursor-pointer select-none"
                    style={{
                      transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left center',
                      transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1)`,
                      zIndex: zIndex,
                    }}
                    onClick={() => handleDesktopSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 2 Right (Goals 1-4 Right) */}
                    <div 
                      className="absolute inset-0 bg-[#fbf7ec]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskRight>{renderSpread2()}</MaskRight>
                    </div>

                    {/* Back: Spread 3 Left (Goals 5-7 Left) */}
                    <div 
                      className="absolute inset-0 bg-[#fbf7ec]"
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskLeft>{renderSpread3()}</MaskLeft>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>

        {/* Bottom Spread Dots */}
        <div className="flex items-center gap-2.5 mt-8 relative z-20">
          {Array.from({ length: totalSpreads }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDesktopSpreadChange(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSpread ? 'bg-gold-deep w-6' : 'bg-line w-2.5 hover:bg-gold/60'}`}
              aria-label={`${idx + 1}번째 스프레드 보기`}
            />
          ))}
        </div>

      </div>

      {/* ==========================================
          [모바일 스택 슬라이더 뷰] max-width: 880px
         ========================================== */}
      <div className="min-[881px]:hidden flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto px-6 relative z-10 py-6">
        
        {/* Stack Container (3D Perspective 추가) */}
        <div className="relative w-full h-[400px] flex items-center justify-center" style={{ perspective: '1000px' }}>
          <AnimatePresence mode="popLayout" custom={direction}>
            {Array.from({ length: totalCards }).map((_, i) => {
              if (i < mobileIndex || i > mobileIndex + 1) return null;
              const isTop = i === mobileIndex;
              
              return (
                <motion.div
                  key={i}
                  custom={direction}
                  variants={cardVariants}
                  className="absolute w-full h-full bg-[#fbf7ec] border border-line/40 rounded-2xl p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(42,38,32,0.12)] cursor-grab active:cursor-grabbing select-none"
                  style={{ 
                    zIndex: isTop ? 10 : 5,
                    transformOrigin: 'top center' 
                  }}
                  drag={isTop ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.8, bottom: 0.15 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -60) {
                      handleNext();
                    } else if (info.offset.y > 60) {
                      handlePrev();
                    }
                  }}
                  initial={isTop 
                    ? (direction === 'prev' 
                        ? { y: -500, rotateX: -60, rotateZ: -8, scale: 0.9, opacity: 0 } 
                        : { y: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1 })
                    : { y: 16, rotateX: 0, rotateZ: 0, scale: 0.94, opacity: 0.7 }
                  }
                  animate={isTop ? { y: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1 } : { y: 16, rotateX: 0, rotateZ: 0, scale: 0.94, opacity: 0.7 }}
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  
                  {/* Card 0: Morning Schedules */}
                  {i === 0 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-en text-[9px] tracking-[0.24em] uppercase text-gold-deep font-semibold mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                          Sunday Morning Schedules
                        </h3>
                        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                          {sortedMorning.map((slot, idx) => {
                            const isWorship = slot.tag === '예배';
                            return (
                              <div key={idx} className={`flex items-center justify-between gap-3 py-2 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep' : 'text-ink'}`}>
                                <div>
                                  <span className={`inline-block font-en text-[7px] tracking-[0.12em] uppercase px-1 py-0.2 mb-0.5 ${isWorship ? 'text-gold-deep border border-gold/40' : 'text-ink-mute border border-line/40'}`}>
                                    {TAG_EN[slot.tag]}
                                  </span>
                                  <div className="font-ko text-[12px] font-bold">{slot.label}</div>
                                </div>
                                <div className="font-en text-[11.5px] text-right shrink-0">
                                  <span className="font-semibold block">{formatTime(slot.time)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="font-en text-[9px] text-ink-mute tracking-widest text-left mt-3 border-t border-line-soft pt-2">
                        01 / 05 · Morning Schedules
                      </div>
                    </div>
                  )}

                  {/* Card 1: Evening Schedules */}
                  {i === 1 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-en text-[9px] tracking-[0.24em] uppercase text-gold-deep font-semibold mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                          Evening Schedules
                        </h3>
                        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                          {sortedEvening.map((slot, idx) => {
                            const isWorship = slot.tag === '예배';
                            return (
                              <div key={idx} className={`flex items-center justify-between gap-3 py-2 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep' : 'text-ink'}`}>
                                <div>
                                  <span className={`inline-block font-en text-[7px] tracking-[0.12em] uppercase px-1 py-0.2 mb-0.5 ${isWorship ? 'text-gold-deep border border-gold/40' : 'text-ink-mute border border-line/40'}`}>
                                    {TAG_EN[slot.tag]}
                                  </span>
                                  <div className="font-ko text-[12px] font-bold">{slot.label}</div>
                                </div>
                                <div className="font-en text-[11.5px] text-right shrink-0">
                                  <span className="font-semibold block">{formatTime(slot.time)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="font-en text-[9px] text-ink-mute tracking-widest text-left mt-3 border-t border-line-soft pt-2">
                        02 / 05 · Evening Schedules
                      </div>
                    </div>
                  )}

                  {/* Card 2: Theme / Motto */}
                  {i === 2 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col items-center text-center my-auto">
                        <span className="font-en text-[9px] tracking-[0.32em] text-gold-deep uppercase mb-4 font-semibold">
                          {data.year} Theme
                        </span>
                        <p className="font-ko font-bold text-[20px] leading-relaxed text-ink tracking-wide break-keep px-2">
                          “{data.themeKo}”
                        </p>
                        {data.themeEn && (
                          <p className="font-en italic text-[11px] text-gold-deep/80 tracking-wide mt-3 max-w-[220px] break-keep">
                            {data.themeEn}
                          </p>
                        )}
                      </div>
                      <div className="font-en text-[9px] text-ink-mute tracking-widest text-right mt-3 border-t border-line-soft pt-2">
                        03 / 05 · Motto
                      </div>
                    </div>
                  )}

                  {/* Card 3: Goals 1-4 */}
                  {i === 3 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-en text-[9px] tracking-[0.24em] uppercase text-gold-deep font-semibold mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                          Annual Aims (I – IV)
                        </h3>
                        <div className="flex flex-col gap-2">
                          {data.goals.slice(0, 4).map((goal, idx) => {
                            const parts = goal.split(/(찬양을 통해)/);
                            return (
                              <div key={idx} className="flex gap-3 items-start py-1.5 border-b border-line-soft last:border-b-0">
                                <div className="font-en italic text-[16px] text-gold/80 leading-none font-medium mt-0.5">{toRoman(idx + 1)}</div>
                                <div className="font-ko text-[11px] leading-relaxed text-ink-soft">
                                  {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep">{p}</b> : p)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="font-en text-[9px] text-ink-mute tracking-widest text-left mt-3 border-t border-line-soft pt-2">
                        04 / 05 · Aims
                      </div>
                    </div>
                  )}

                  {/* Card 4: Goals 5-7 */}
                  {i === 4 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-en text-[9px] tracking-[0.24em] uppercase text-gold-deep font-semibold mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                          Annual Aims (V – VII)
                        </h3>
                        <div className="flex flex-col gap-2">
                          {data.goals.slice(4).map((goal, idx) => {
                            const actualIdx = idx + 4;
                            const parts = goal.split(/(찬양을 통해)/);
                            return (
                              <div key={actualIdx} className="flex gap-3 items-start py-1.5 border-b border-line-soft last:border-b-0">
                                <div className="font-en italic text-[16px] text-gold/80 leading-none font-medium mt-0.5">{toRoman(actualIdx + 1)}</div>
                                <div className="font-ko text-[11px] leading-relaxed text-ink-soft">
                                  {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep">{p}</b> : p)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="font-en text-[9px] text-ink-mute tracking-widest text-right mt-3 border-t border-line-soft pt-2">
                        05 / 05 · Aims
                      </div>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation controls */}
        <div className="flex items-center justify-between w-full mt-8 relative z-20">
          
          <button
            type="button"
            onClick={handlePrev}
            disabled={mobileIndex === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-line bg-card/85 text-ink shadow-sm hover:border-gold hover:text-gold-deep disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="이전 카드"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalCards }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMobileIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === mobileIndex ? 'bg-gold-deep w-4' : 'bg-line w-2'}`}
                aria-label={`${i + 1}번째 페이지 보기`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={mobileIndex === totalCards - 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-line bg-card/85 text-ink shadow-sm hover:border-gold hover:text-gold-deep disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음 카드"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

        </div>

        <div className="mt-4 text-ink-mute text-[9px] uppercase tracking-widest text-center select-none pointer-events-none">
          Swipe up/down or tap arrows to navigate
        </div>

      </div>

    </div>
  );
}
