'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PracticeSlot } from '@/lib/types';
import Crest from './Crest';

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

export default function PracticeClient({ data }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);

  // 모바일 카드 개수: 4개
  // 0: 일정, 1: 표어, 2: 목표 1-4, 3: 목표 5-7
  const totalCards = 4;

  const handleNext = () => {
    if (mobileIndex < totalCards - 1) {
      setMobileIndex(mobileIndex + 1);
    }
  };

  const handlePrev = () => {
    if (mobileIndex > 0) {
      setMobileIndex(mobileIndex - 1);
    }
  };

  // 1페이지(스케줄)용 오전/오후 정렬
  const morning = data.practice.filter((_, idx) => idx <= 2);
  const evening = data.practice.filter((_, idx) => idx > 2);
  const sortedSchedules = [...[morning[1], morning[0], morning[2]].filter(Boolean), ...[evening[1], evening[0]].filter(Boolean)];

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-cream px-0 pt-20 pb-8 select-none">
      
      {/* 1. 백그라운드 라틴어 마키 연출 (일관성 확보) */}
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
      <div className="pointer-events-none relative z-20 mx-auto text-center shrink-0">
        <h1 className="font-en text-[clamp(40px,4.8vw,68px)] font-bold leading-[0.85] tracking-normal text-ink">
          Hours &amp; Aims
        </h1>
        <p className="mt-4 font-ko text-[clamp(12px,1.4vw,16px)] font-medium tracking-normal text-ink-soft">
          연습 시간 · {data.year} 목표
        </p>
      </div>

      {/* ==========================================
          [데스크톱 뷰] min-width: 881px
         ========================================== */}
      <div className="hidden min-[881px]:flex flex-col items-center justify-center flex-1 w-full max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Book Wrapper & Shadows */}
        <div className="relative w-full max-w-[960px] h-[550px] flex items-center justify-center">
          
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => setIsFlipped(false)}
            disabled={!isFlipped}
            className={`absolute -left-16 z-30 w-12 h-12 flex items-center justify-center rounded-full border border-line bg-card/85 text-ink shadow-md transition-all duration-300 hover:border-gold hover:text-gold-deep disabled:opacity-0 disabled:cursor-not-allowed`}
            aria-label="이전 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            disabled={isFlipped}
            className={`absolute -right-16 z-30 w-12 h-12 flex items-center justify-center rounded-full border border-line bg-card/85 text-ink shadow-md transition-all duration-300 hover:border-gold hover:text-gold-deep disabled:opacity-0 disabled:cursor-not-allowed`}
            aria-label="다음 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Perspective Container */}
          <div className="relative w-full h-full perspective-[1600px] transform-style-preserve-3d">
            
            {/* Book Body */}
            <div className="absolute inset-0 flex transform-style-preserve-3d shadow-[0_28px_90px_rgba(42,38,32,0.22)] rounded-2xl bg-card border border-line/42">
              
              {/* [Page 1] Static Left Page (Schedules) */}
              <div className="w-1/2 h-full bg-[#fbf7ec] border-r border-[#d4c4a0]/40 rounded-l-2xl px-12 py-10 flex flex-col justify-between relative overflow-hidden select-none">
                {/* Book inner left shadow (spine crease shadow) */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/[0.04] to-transparent pointer-events-none" />
                
                <div>
                  <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    Worship &amp; Practice Hours
                  </h3>
                  <div className="flex flex-col gap-4">
                    {sortedSchedules.map((slot, i) => {
                      const isWorship = slot.tag === '예배';
                      return (
                        <div key={i} className={`flex items-center justify-between gap-4 py-2.5 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep font-medium' : 'text-ink'}`}>
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
                  I / IV · Schedules
                </div>
              </div>

              {/* [Page 4] Static Right Page (Goals 5-7) */}
              <div className="w-1/2 h-full bg-[#fbf7ec] rounded-r-2xl px-12 py-10 flex flex-col justify-between relative overflow-hidden select-none">
                {/* Book inner right shadow (spine crease shadow) */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/[0.04] to-transparent pointer-events-none" />
                
                <div>
                  <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    Annual Aims (V – VII)
                  </h3>
                  <div className="flex flex-col gap-4">
                    {data.goals.slice(4).map((goal, i) => {
                      const idx = i + 4;
                      const parts = goal.split(/(찬양을 통해)/);
                      return (
                        <div key={idx} className="flex gap-4 items-start py-3.5 border-b border-line-soft last:border-b-0">
                          <div className="font-en italic text-[22px] text-gold/80 leading-none font-medium mt-0.5">{toRoman(idx + 1)}</div>
                          <div className="font-ko text-[13px] leading-relaxed text-ink-soft">
                            {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep">{p}</b> : p)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="font-en text-[10px] text-ink-mute tracking-widest text-right mt-4 border-t border-line-soft pt-3">
                  IV / IV · Aims
                </div>
              </div>

              {/* 3D Flipping Page (Sheet 1) */}
              <div
                className="absolute right-0 top-0 w-1/2 h-full transform-origin-left transform-style-preserve-3d transition-transform duration-800 ease-in-out cursor-pointer select-none z-20"
                style={{
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                
                {/* [Page 2] Front Face (Theme / Motto) */}
                <div className="absolute inset-0 bg-[#fbf7ec] rounded-r-2xl px-12 py-10 flex flex-col justify-between border-l border-line/20 backface-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/[0.04] to-transparent pointer-events-none" />
                  
                  <div className="flex flex-col items-center text-center my-auto">
                    <div className="w-16 h-16 flex items-center justify-center opacity-70 mb-4 scale-90">
                      <Crest />
                    </div>
                    
                    <span className="font-en text-[10px] tracking-[0.38em] text-gold-deep uppercase mb-3 font-semibold">
                      {data.year} Theme
                    </span>
                    
                    <p className="font-ko font-bold text-[24px] leading-relaxed text-ink tracking-wide mt-2 break-keep px-4">
                      “{data.themeKo}”
                    </p>
                    
                    {data.themeEn && (
                      <p className="font-en italic text-[12px] text-gold-deep/80 tracking-wide mt-4 max-w-[280px] break-keep">
                        {data.themeEn}
                      </p>
                    )}
                  </div>
                  
                  <div className="font-en text-[10px] text-ink-mute tracking-widest text-right mt-4 border-t border-line-soft pt-3">
                    II / IV · Motto
                  </div>
                </div>

                {/* [Page 3] Back Face (Goals 1-4) */}
                <div
                  className="absolute inset-0 bg-[#fbf7ec] rounded-l-2xl px-12 py-10 flex flex-col justify-between border-r border-line/20 backface-hidden"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/[0.04] to-transparent pointer-events-none" />
                  
                  <div>
                    <h3 className="font-en text-[10px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      Annual Aims (I – IV)
                    </h3>
                    <div className="flex flex-col gap-3.5">
                      {data.goals.slice(0, 4).map((goal, i) => {
                        const parts = goal.split(/(찬양을 통해)/);
                        return (
                          <div key={i} className="flex gap-4 items-start py-2.5 border-b border-line-soft last:border-b-0">
                            <div className="font-en italic text-[20px] text-gold/80 leading-none font-medium mt-0.5">{toRoman(i + 1)}</div>
                            <div className="font-ko text-[13px] leading-relaxed text-ink-soft">
                              {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep">{p}</b> : p)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="font-en text-[10px] text-ink-mute tracking-widest text-left mt-4 border-t border-line-soft pt-3">
                    III / IV · Aims
                  </div>
                </div>

              </div>

              {/* Book Center Spine Line */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#d4c4a0]/50 z-30 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/[0.03] via-transparent to-black/[0.03] z-30 pointer-events-none" />

            </div>
          </div>
        </div>

        {/* Bottom Spread Dots */}
        <div className="flex items-center gap-2.5 mt-8 relative z-20">
          <button
            type="button"
            onClick={() => setIsFlipped(false)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${!isFlipped ? 'bg-gold-deep w-6' : 'bg-line hover:bg-gold/60'}`}
            aria-label="1, 2페이지 보기"
          />
          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isFlipped ? 'bg-gold-deep w-6' : 'bg-line hover:bg-gold/60'}`}
            aria-label="3, 4페이지 보기"
          />
        </div>

      </div>

      {/* ==========================================
          [모바일 스택 슬라이더 뷰] max-width: 880px
         ========================================== */}
      <div className="min-[881px]:hidden flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto px-6 relative z-10 py-6">
        
        {/* Stack Container */}
        <div className="relative w-full h-[400px] flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {/* 4개의 카드 중 현재 및 대기중인 카드들을 겹쳐서 표시 */}
            {Array.from({ length: totalCards }).map((_, i) => {
              // 화면에는 현재 인덱스(mobileIndex)부터 최대 2개만 그림 (메모리 및 렌더링 최적화)
              if (i < mobileIndex || i > mobileIndex + 1) return null;

              const isTop = i === mobileIndex;
              
              return (
                <motion.div
                  key={i}
                  className="absolute w-full h-full bg-[#fbf7ec] border border-line/40 rounded-2xl p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(42,38,32,0.12)] cursor-grab active:cursor-grabbing select-none"
                  style={{ zIndex: isTop ? 10 : 5 }}
                  // 드래그 제스처 바인딩
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) {
                      handleNext();
                    } else if (info.offset.x > 80) {
                      handlePrev();
                    }
                  }}
                  // 모션 애니메이션 속성 정의
                  initial={isTop ? { x: 0, scale: 1, opacity: 1 } : { y: 12, scale: 0.95, opacity: 0.72 }}
                  animate={
                    isTop 
                      ? { x: 0, y: 0, scale: 1, opacity: 1 } 
                      : { y: 12, scale: 0.95, opacity: 0.72 }
                  }
                  exit={{
                    x: mobileIndex > i ? -300 : 300, // 이전 카드가 돌아오거나 다음으로 넘어갈 때 방향 다르게
                    rotate: mobileIndex > i ? -10 : 10,
                    opacity: 0,
                    transition: { duration: 0.35, ease: "easeOut" }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  
                  {/* 카드 내용 렌더링 */}
                  {i === 0 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-en text-[9px] tracking-[0.24em] uppercase text-gold-deep font-semibold mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                          Schedules
                        </h3>
                        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                          {sortedSchedules.map((slot, idx) => {
                            const isWorship = slot.tag === '예배';
                            return (
                              <div key={idx} className={`flex items-center justify-between gap-3 py-1.5 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep' : 'text-ink'}`}>
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
                        01 / 04 · Schedules
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col items-center text-center my-auto">
                        <div className="w-12 h-12 flex items-center justify-center opacity-60 mb-2 scale-75">
                          <Crest />
                        </div>
                        <span className="font-en text-[9px] tracking-[0.32em] text-gold-deep uppercase mb-2 font-semibold">
                          {data.year} Theme
                        </span>
                        <p className="font-ko font-bold text-[18px] leading-relaxed text-ink tracking-wide break-keep px-2">
                          “{data.themeKo}”
                        </p>
                        {data.themeEn && (
                          <p className="font-en italic text-[11px] text-gold-deep/80 tracking-wide mt-2 max-w-[220px] break-keep">
                            {data.themeEn}
                          </p>
                        )}
                      </div>
                      <div className="font-en text-[9px] text-ink-mute tracking-widest text-right mt-3 border-t border-line-soft pt-2">
                        02 / 04 · Motto
                      </div>
                    </div>
                  )}

                  {i === 2 && (
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
                        03 / 04 · Aims
                      </div>
                    </div>
                  )}

                  {i === 3 && (
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
                        04 / 04 · Aims
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
          Swipe left/right or tap arrows to navigate
        </div>

      </div>

    </div>
  );
}
