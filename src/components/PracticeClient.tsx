'use client';

import { useState, useEffect } from 'react';
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
      className="absolute left-0 top-0 w-[calc(100%+1px)] h-full overflow-hidden rounded-l-2xl bg-[#ffffff]"
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

// W_half 내에서 전체 1020px 너비 of 콘텐츠 중 오른쪽 50%만 마스킹하여 렌더링
function MaskRight({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="absolute right-0 top-0 w-[calc(100%+1px)] h-full overflow-hidden rounded-r-2xl bg-[#ffffff]"
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

// 모바일: 세로 480px 중 상단 240px만 마스킹하여 렌더링
function MaskTop({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="absolute left-0 top-0 w-full h-[calc(100%+1px)] overflow-hidden rounded-t-2xl bg-[#ffffff]"
      style={{
        borderTop: '1px solid rgba(212, 196, 160, 0.42)',
        borderLeft: '1px solid rgba(212, 196, 160, 0.42)',
        borderRight: '1px solid rgba(212, 196, 160, 0.42)',
      }}
    >
      <div className="absolute left-0 top-0 w-full h-[200%] pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

// 모바일: 세로 480px 중 하단 240px만 마스킹하여 렌더링
function MaskBottom({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="absolute left-0 bottom-0 w-full h-[calc(100%+1px)] overflow-hidden rounded-b-2xl bg-[#ffffff]"
      style={{
        borderBottom: '1px solid rgba(212, 196, 160, 0.42)',
        borderLeft: '1px solid rgba(212, 196, 160, 0.42)',
        borderRight: '1px solid rgba(212, 196, 160, 0.42)',
      }}
    >
      <div className="absolute left-0 top-[-100%] w-full h-[200%] pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

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

  // transition이 시작되면 브라우저 환경(화면 크기 변경, display: none 전환 등)에 의해
  // onTransitionEnd가 호출되지 않을 때를 대비해 일정 시간 후 강제로 전환 상태를 해제하는 안전 장치
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration * 1000 + 100);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionDuration]);

  const handleSpreadChange = (nextSpread: number) => {
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
      <div className={`flex gap-5 xl:gap-7 items-start py-4 xl:py-5.5 ${showBorder ? 'border-b border-line-soft last:border-b-0' : ''}`}>
        <div className="font-en italic text-[26px] xl:text-[30px] text-gold/80 leading-none font-medium mt-0.5">{toRoman(index + 1)}</div>
        <div className="font-ko text-[17px] xl:text-[19.5px] leading-relaxed text-ink font-medium">
          {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep font-bold">{p}</b> : p)}
        </div>
      </div>
    );
  };

  const renderMobileGoalItem = (goal: string | undefined, index: number, showBorder = true) => {
    if (!goal) return null;
    const parts = goal.split(/(찬양을 통해)/);
    return (
      <div className={`flex gap-3.5 items-start py-2.5 ${showBorder ? 'border-b border-line-soft last:border-b-0' : ''}`}>
        <div className="font-en italic text-[26px] text-gold/90 leading-none font-semibold mt-0.5">{toRoman(index + 1)}</div>
        <div className="font-ko text-[16px] leading-relaxed text-ink font-medium">
          {parts.map((p, pIdx) => p === '찬양을 통해' ? <b key={pIdx} className="text-gold-deep font-bold">{p}</b> : p)}
        </div>
      </div>
    );
  };

  // ==========================================
  // [데스크톱 와이드 스프레드 선언]
  // ==========================================
  
  // Spread 0: 일정 (주일 오전 & 주일 저녁)
  const renderSpread0 = () => (
    <div className="w-full h-full flex select-none">
      <div className="w-1/2 h-full px-12 xl:px-16 py-10 xl:py-14 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[10px] xl:text-[12px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Sunday Weekly Schedules
          </h3>
          <div className="flex flex-col gap-4 xl:gap-6">
            {sortedMorning.map((slot, i) => {
              const isWorship = slot.tag === '예배';
              return (
                <div key={i} className={`flex items-center justify-between gap-4 py-3 xl:py-4.5 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep font-medium' : 'text-ink'}`}>
                  <div>
                    <span className={`inline-block font-en text-[8px] xl:text-[9px] tracking-[0.14em] uppercase px-1.5 py-0.5 mb-1 ${isWorship ? 'text-gold-deep border border-gold/40 bg-gold/5' : 'text-ink-mute border border-line/40'}`}>
                      {TAG_EN[slot.tag]}
                    </span>
                    <div className="font-ko text-[16px] xl:text-[18.5px] font-bold">{slot.label}</div>
                  </div>
                  <div className="font-en text-[15.5px] xl:text-[17.5px] text-right shrink-0">
                    <span className="font-semibold block">{formatTime(slot.time)}</span>
                    <span className="font-ko text-[11.5px] xl:text-[13px] text-ink-mute block mt-0.5">{slot.time}</span>
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
      
      <div className="w-1/2 h-full px-12 xl:px-16 py-10 xl:py-14 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[10px] xl:text-[12px] tracking-[0.28em] uppercase text-gold-deep font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Evening Schedules
          </h3>
          <div className="flex flex-col gap-4 xl:gap-6">
            {sortedEvening.map((slot, idx) => {
              const isWorship = slot.tag === '예배';
              return (
                <div key={idx} className={`flex items-center justify-between gap-4 py-3 xl:py-4.5 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep font-medium' : 'text-ink'}`}>
                  <div>
                    <span className={`inline-block font-en text-[8px] xl:text-[9px] tracking-[0.14em] uppercase px-1.5 py-0.5 mb-1 ${isWorship ? 'text-gold-deep border border-gold/40 bg-gold/5' : 'text-ink-mute border border-line/40'}`}>
                      {TAG_EN[slot.tag]}
                    </span>
                    <div className="font-ko text-[16px] xl:text-[18.5px] font-bold">{slot.label}</div>
                  </div>
                  <div className="font-en text-[15.5px] xl:text-[17.5px] text-right shrink-0">
                    <span className="font-semibold block">{formatTime(slot.time)}</span>
                    <span className="font-ko text-[11.5px] xl:text-[13px] text-ink-mute block mt-0.5">{slot.time}</span>
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
    <div className="w-full h-full flex flex-col justify-between px-16 xl:px-20 py-10 xl:py-14 select-none">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <span className="font-en text-[10px] xl:text-[12px] tracking-[0.28em] uppercase text-gold-deep font-semibold">
          {data.year} Congregation Motto
        </span>
        <span className="font-en text-[10px] xl:text-[12px] tracking-[0.28em] uppercase text-gold-deep font-semibold">
          Praise Choir
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6">
        <p className="font-ko font-bold text-[clamp(28px,3.2vw,48px)] xl:text-[46px] leading-snug text-ink tracking-[0.05em] whitespace-nowrap">
          {data.themeKo}
        </p>
        {data.themeEn && (
          <p className="font-en italic text-[15px] xl:text-[18px] text-gold-deep/80 tracking-wider mt-5 max-w-[600px] border-t border-gold/20 pt-4 leading-relaxed">
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
    <div className="w-full h-full flex flex-col justify-between px-16 xl:px-20 py-10 xl:py-14 select-none">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <h3 className="font-en text-[10px] xl:text-[12px] tracking-[0.28em] uppercase text-gold-deep font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          Annual Aims (I – IV)
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-x-16 xl:gap-x-20 gap-y-1 py-4 my-auto items-center">
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
    <div className="w-full h-full flex flex-col justify-between px-16 xl:px-20 py-10 xl:py-14 select-none">
      <div className="flex justify-between items-center border-b border-line-soft pb-3">
        <h3 className="font-en text-[10px] xl:text-[12px] tracking-[0.28em] uppercase text-gold-deep font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          Annual Aims (V – VII)
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-x-16 xl:gap-x-20 gap-y-1 py-4 my-auto items-center">
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
          <span className="font-en italic text-[11px] xl:text-[13px] text-gold-deep tracking-[0.2em] uppercase">Praise Choir</span>
        </div>
      </div>

      <div className="flex justify-between font-en text-[10px] text-ink-mute tracking-widest border-t border-line-soft pt-3">
        <span>VII / VIII · Aims</span>
        <span>VIII / VIII · Aims</span>
      </div>
    </div>
  );

  // ==========================================
  // [모바일 세로형 스프레드 선언]
  // ==========================================
  
  // Mobile Spread 0: 일정 (주일 오전 & 주일 저녁)
  const renderMobileSpread0 = () => (
    <div className="w-full h-full flex flex-col select-none text-left">
      {/* Top Half: Morning Schedules */}
      <div className="w-full h-1/2 px-6 py-4 flex flex-col justify-between border-b border-dashed border-gold/20">
        <div>
          <h3 className="font-en text-[10px] tracking-[0.2em] uppercase text-gold-deep font-bold mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Sunday Morning
          </h3>
          <div className="flex flex-col gap-1">
            {sortedMorning.map((slot, i) => {
              const isWorship = slot.tag === '예배';
              return (
                <div key={i} className={`flex items-center justify-between gap-3 py-1.5 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep' : 'text-ink'}`}>
                  <div>
                    <span className={`inline-block font-en text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 mb-1 ${isWorship ? 'text-gold-deep border border-gold/50 bg-gold/5 font-semibold' : 'text-ink-mute border border-line/50 font-medium'}`}>
                      {TAG_EN[slot.tag]}
                    </span>
                    <div className="font-ko text-[16.5px] font-extrabold leading-tight text-ink">{slot.label}</div>
                  </div>
                  <div className="font-en text-[15px] text-right shrink-0">
                    <span className="font-bold block text-ink">{formatTime(slot.time)}</span>
                    <span className="font-ko text-[11px] text-ink-mute block mt-0.5">{slot.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-left pt-1 border-t border-line-soft">
          I / VIII · Morning
        </div>
      </div>
      
      {/* Bottom Half: Evening Schedules */}
      <div className="w-full h-1/2 px-6 py-4 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[10px] tracking-[0.2em] uppercase text-gold-deep font-bold mb-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Sunday Evening
          </h3>
          <div className="flex flex-col gap-1">
            {sortedEvening.map((slot, idx) => {
              const isWorship = slot.tag === '예배';
              return (
                <div key={idx} className={`flex items-center justify-between gap-3 py-1.5 border-b border-line-soft last:border-b-0 ${isWorship ? 'text-gold-deep' : 'text-ink'}`}>
                  <div>
                    <span className={`inline-block font-en text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 mb-1 ${isWorship ? 'text-gold-deep border border-gold/50 bg-gold/5 font-semibold' : 'text-ink-mute border border-line/50 font-medium'}`}>
                      {TAG_EN[slot.tag]}
                    </span>
                    <div className="font-ko text-[16.5px] font-extrabold leading-tight text-ink">{slot.label}</div>
                  </div>
                  <div className="font-en text-[15px] text-right shrink-0">
                    <span className="font-bold block text-ink">{formatTime(slot.time)}</span>
                    <span className="font-ko text-[11px] text-ink-mute block mt-0.5">{slot.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-right pt-1 border-t border-line-soft">
          II / VIII · Evening
        </div>
      </div>
    </div>
  );

  // Mobile Spread 1: 표어
  const renderMobileSpread1 = () => (
    <div className="w-full h-full flex flex-col select-none">
      {/* Top Half: Theme Korean */}
      <div className="w-full h-1/2 px-6 py-5 flex flex-col justify-between border-b border-dashed border-gold/20">
        <div className="flex justify-between items-center border-b border-line-soft pb-1.5">
          <span className="font-en text-[10px] tracking-[0.16em] uppercase text-gold-deep font-bold">
            {data.year} Motto
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-center my-auto">
          <p className="font-ko font-extrabold text-[22px] leading-snug text-ink tracking-[0.02em] break-keep px-2">
            {data.themeKo}
          </p>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-left pt-1 border-t border-line-soft">
          III / VIII · Motto
        </div>
      </div>

      {/* Bottom Half: Theme English */}
      <div className="w-full h-1/2 px-6 py-5 flex flex-col justify-between">
        <div className="flex justify-between items-center border-b border-line-soft pb-1.5">
          <span className="font-en text-[11px] tracking-[0.16em] uppercase text-gold-deep font-bold">
            Praise Choir
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-center my-auto">
          {data.themeEn ? (
            <p className="font-en italic text-[15px] text-gold-deep/90 tracking-wide leading-relaxed px-2 break-keep font-medium">
              {data.themeEn}
            </p>
          ) : (
            <p className="font-en italic text-[13px] text-gold-deep/40 tracking-[0.2em] uppercase font-medium">
              Soli Deo Gloria
            </p>
          )}
        </div>
        <div className="font-en text-[11px] text-ink-mute tracking-widest text-right pt-1 border-t border-line-soft">
          IV / VIII · Motto
        </div>
      </div>
    </div>
  );

  // Mobile Spread 2: 목표 I-II (Top) & Goals III-IV (Bottom)
  const renderMobileSpread2 = () => (
    <div className="w-full h-full flex flex-col select-none text-left">
      {/* Top Half: Goals 1-2 */}
      <div className="w-full h-1/2 px-6 py-5 flex flex-col justify-between border-b border-dashed border-gold/20">
        <div>
          <h3 className="font-en text-[11px] tracking-[0.2em] uppercase text-gold-deep font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Aims (I – II)
          </h3>
          <div className="flex flex-col">
            {renderMobileGoalItem(data.goals[0], 0, true)}
            {renderMobileGoalItem(data.goals[1], 1, false)}
          </div>
        </div>
        <div className="font-en text-[11px] text-ink-mute tracking-widest text-left pt-1 border-t border-line-soft">
          V / VIII · Aims
        </div>
      </div>

      {/* Bottom Half: Goals 3-4 */}
      <div className="w-full h-1/2 px-6 py-5 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[11px] tracking-[0.2em] uppercase text-gold-deep font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Aims (III – IV)
          </h3>
          <div className="flex flex-col">
            {renderMobileGoalItem(data.goals[2], 2, true)}
            {renderMobileGoalItem(data.goals[3], 3, false)}
          </div>
        </div>
        <div className="font-en text-[8px] text-ink-mute tracking-widest text-right pt-1.5 border-t border-line-soft">
          VI / VIII · Aims
        </div>
      </div>
    </div>
  );

  // Mobile Spread 3: 목표 V-VI (Top) & Goals VII (Bottom)
  const renderMobileSpread3 = () => (
    <div className="w-full h-full flex flex-col select-none text-left">
      {/* Top Half: Goals 5-6 */}
      <div className="w-full h-1/2 px-6 py-5 flex flex-col justify-between border-b border-dashed border-gold/20">
        <div>
          <h3 className="font-en text-[10px] tracking-[0.2em] uppercase text-gold-deep font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Aims (V – VI)
          </h3>
          <div className="flex flex-col">
            {renderMobileGoalItem(data.goals[4], 4, true)}
            {renderMobileGoalItem(data.goals[5], 5, false)}
          </div>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-left pt-1 border-t border-line-soft">
          VII / VIII · Aims
        </div>
      </div>

      {/* Bottom Half: Goal 7 & Logo */}
      <div className="w-full h-1/2 px-6 py-5 flex flex-col justify-between">
        <div>
          <h3 className="font-en text-[10px] tracking-[0.2em] uppercase text-gold-deep font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            Aims (VII)
          </h3>
          <div className="flex flex-col">
            {renderMobileGoalItem(data.goals[6], 6, false)}
            
            {!data.goals[6] && (
              <div className="flex items-center justify-center py-6 opacity-30 select-none pointer-events-none">
                <span className="font-en italic text-[12px] text-gold-deep tracking-[0.2em] uppercase">Praise Choir</span>
              </div>
            )}
          </div>
        </div>
        <div className="font-en text-[10px] text-ink-mute tracking-widest text-right pt-1 border-t border-line-soft">
          VIII / VIII · Aims
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-cream px-0 pt-6 md:pt-14 pb-6 select-none">
      
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
      <div className="pointer-events-none relative z-20 mx-auto text-center shrink-0 mt-8 md:mt-6 mb-2">
        <h1 className="font-en text-[clamp(32px,3.8vw,48px)] font-bold leading-none tracking-normal text-ink">
          Hours &amp; Aims
        </h1>
      </div>

      {/* ==========================================
          [데스크톱 뷰] min-width: 881px
         ========================================== */}
      <div className="hidden min-[881px]:flex flex-col items-center justify-center flex-1 w-full max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Book Wrapper (화면 크기에 따라 유연하게 웅장해지는 스케일 업) */}
        <div className="relative w-full max-w-[1020px] xl:max-w-[1240px] h-[480px] xl:h-[580px] flex items-center justify-center rounded-2xl shadow-[0_28px_90px_rgba(42,38,32,0.16)] bg-[#ffffff] transition-all duration-300">
          


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
                    onClick={() => handleSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 0 Right (Evening Schedules) */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskRight>{renderSpread0()}</MaskRight>
                    </div>

                    {/* Back: Spread 1 Left (Motto Left) */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
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
                    onClick={() => handleSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 1 Right (Motto Right) */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskRight>{renderSpread1()}</MaskRight>
                    </div>

                    {/* Back: Spread 2 Left (Goals 1-4 Left) */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
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
                    onClick={() => handleSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 2 Right (Goals 1-4 Right) */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskRight>{renderSpread2()}</MaskRight>
                    </div>

                    {/* Back: Spread 3 Left (Goals 5-7 Left) */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
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
              onClick={() => handleSpreadChange(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSpread ? 'bg-gold-deep w-6' : 'bg-line w-2.5 hover:bg-gold/60'}`}
              aria-label={`${idx + 1}번째 스프레드 보기`}
            />
          ))}
        </div>

      </div>

      {/* ==========================================
          [모바일 세로형 북플립 뷰] max-width: 880px
         ========================================== */}
      <div className="min-[881px]:hidden flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto px-6 relative z-10 py-3">
        
        {/* Book Wrapper */}
        <div className="relative w-full max-w-[320px] max-h-[50vh] aspect-[340/480] flex flex-col items-center justify-center rounded-2xl shadow-[0_20px_60px_rgba(42,38,32,0.14)] bg-[#ffffff]">
          


          {/* Perspective Container */}
          <div className="relative w-full h-full" style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}>
            
            {/* Book Body (Background) */}
            <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* [Page 1] Static Top Page (Spread 0 Top) */}
              <div className="absolute left-0 top-0 w-full h-1/2">
                <MaskTop>{renderMobileSpread0()}</MaskTop>
              </div>

              {/* [Page 8] Static Bottom Page (Spread 3 Bottom) */}
              <div className="absolute left-0 bottom-0 w-full h-1/2">
                <MaskBottom>{renderMobileSpread3()}</MaskBottom>
              </div>

              {/* ==========================================
                  3D Flipping Page Sheets (Vertical X-axis)
                 ========================================== */}

              {/* [Sheet 0] Pages 2 (Spread 0 Bottom) & 3 (Spread 1 Top) */}
              {(() => {
                const i = 0;
                const isFlipped = activeSpread > i;
                const isFlipping = isTransitioning && Math.min(prevSpread, activeSpread) === i;
                
                let zIndex = isFlipped ? 10 + i : 30 - i;
                if (isFlipping) zIndex = 40;

                return (
                  <div
                    className="absolute left-0 bottom-0 w-full h-1/2 cursor-pointer select-none"
                    style={{
                      transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center top',
                      transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1)`,
                      zIndex: zIndex,
                    }}
                    onClick={() => handleSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 0 Bottom */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskBottom>{renderMobileSpread0()}</MaskBottom>
                    </div>

                    {/* Back: Spread 1 Top */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ transform: 'rotateX(-180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskTop>{renderMobileSpread1()}</MaskTop>
                    </div>
                  </div>
                );
              })()}

              {/* [Sheet 1] Pages 4 (Spread 1 Bottom) & 5 (Spread 2 Top) */}
              {(() => {
                const i = 1;
                const isFlipped = activeSpread > i;
                const isFlipping = isTransitioning && Math.min(prevSpread, activeSpread) === i;
                
                let zIndex = isFlipped ? 10 + i : 30 - i;
                if (isFlipping) zIndex = 40;

                return (
                  <div
                    className="absolute left-0 bottom-0 w-full h-1/2 cursor-pointer select-none"
                    style={{
                      transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center top',
                      transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1)`,
                      zIndex: zIndex,
                    }}
                    onClick={() => handleSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 1 Bottom */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskBottom>{renderMobileSpread1()}</MaskBottom>
                    </div>

                    {/* Back: Spread 2 Top */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ transform: 'rotateX(-180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskTop>{renderMobileSpread2()}</MaskTop>
                    </div>
                  </div>
                );
              })()}

              {/* [Sheet 2] Pages 6 (Spread 2 Bottom) & 7 (Spread 3 Top) */}
              {(() => {
                const i = 2;
                const isFlipped = activeSpread > i;
                const isFlipping = isTransitioning && Math.min(prevSpread, activeSpread) === i;
                
                let zIndex = isFlipped ? 10 + i : 30 - i;
                if (isFlipping) zIndex = 40;

                return (
                  <div
                    className="absolute left-0 bottom-0 w-full h-1/2 cursor-pointer select-none"
                    style={{
                      transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center top',
                      transition: `transform ${transitionDuration}s cubic-bezier(0.25, 1, 0.5, 1)`,
                      zIndex: zIndex,
                    }}
                    onClick={() => handleSpreadChange(isFlipped ? i : i + 1)}
                    onTransitionEnd={() => {
                      if (Math.min(prevSpread, activeSpread) === i) {
                        setIsTransitioning(false);
                      }
                    }}
                  >
                    {/* Front: Spread 2 Bottom */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskBottom>{renderMobileSpread2()}</MaskBottom>
                    </div>

                    {/* Back: Spread 3 Top */}
                    <div 
                      className="absolute inset-0 bg-[#ffffff]"
                      style={{ transform: 'rotateX(-180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                      <MaskTop>{renderMobileSpread3()}</MaskTop>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Middle Seam (horizontal line/shadow representing the notebook binding) */}
            <div className="absolute top-[calc(50%-1px)] left-0 w-full h-[2px] bg-gold/15 shadow-[0_1px_3px_rgba(0,0,0,0.05)] pointer-events-none z-50" />
            
          </div>
        </div>

        {/* Bottom Spread Dots */}
        <div className="flex items-center gap-2 mt-6 relative z-20">
          {Array.from({ length: totalSpreads }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSpreadChange(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === activeSpread ? 'bg-gold-deep w-5' : 'bg-line w-2 hover:bg-gold/60'}`}
              aria-label={`${idx + 1}번째 페이지 보기`}
            />
          ))}
        </div>



      </div>

    </div>
  );
}
