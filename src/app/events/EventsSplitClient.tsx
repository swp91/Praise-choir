'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChoirEvent } from '@/lib/types';

interface EventsSplitClientProps {
  scheduleYear: number;
  reportYear: number;
  scheduleEvents: ChoirEvent[];
  reportEvents: ChoirEvent[];
}

type Status = { kind: 'done' } | { kind: 'tbd' } | { kind: 'upcoming'; days: number };

function parseSpecificDate(event: ChoirEvent): Date | null {
  if (event.eventDate) {
    const [year, month, day] = event.eventDate.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }

  if (!event.detail) return null;
  const m1 = event.detail.match(/20(\d{2})\.(\d{2})\.(\d{2})/);
  if (m1) return new Date(2000 + parseInt(m1[1]), parseInt(m1[2]) - 1, parseInt(m1[3]));
  const m2 = event.detail.match(/^(\d{2})\/(\d{2})/);
  if (m2) {
    const ym = event.when.match(/^(\d{2})\./);
    return new Date(ym ? 2000 + parseInt(ym[1]) : 2026, parseInt(m2[1]) - 1, parseInt(m2[2]));
  }
  return null;
}

function computeStatus(event: ChoirEvent, today: Date): Status {
  if (event.when === '미정') return { kind: 'tbd' };

  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const specific = parseSpecificDate(event);

  if (specific) {
    const d = new Date(specific.getFullYear(), specific.getMonth(), specific.getDate()).getTime();
    if (d < todayMs) return { kind: 'done' };
    return { kind: 'upcoming', days: Math.ceil((d - todayMs) / 86400000) };
  }

  const m = event.when.match(/^(\d{2})\.(\d{2})$/);
  if (!m) return { kind: 'tbd' };
  const yr = 2000 + parseInt(m[1]);
  const mo = parseInt(m[2]) - 1;
  const endMs = new Date(yr, mo + 1, 0).getTime();
  if (endMs < todayMs) return { kind: 'done' };
  const firstMs = new Date(yr, mo, 1).getTime();
  if (firstMs <= todayMs) return { kind: 'upcoming', days: 0 };
  return { kind: 'upcoming', days: Math.ceil((firstMs - todayMs) / 86400000) };
}

export default function EventsSplitClient({
  scheduleYear,
  reportYear,
  scheduleEvents,
  reportEvents,
}: EventsSplitClientProps) {
  const [activeYear, setActiveYear] = useState<number>(scheduleYear);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);

  const today = useMemo(() => new Date(), []);

  // Get active list of events based on year
  const activeEvents = activeYear === scheduleYear ? scheduleEvents : reportEvents;

  // Left/Top container wheel scroll sync
  const handleLeftWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  // Left/Top container touch swipe sync for mobile
  const handleLeftTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleLeftTouchMove = (e: React.TouchEvent) => {
    if (scrollContainerRef.current) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartRef.current - touchY;
      scrollContainerRef.current.scrollTop += deltaY * 1.5; // Multiply for better responsiveness
      touchStartRef.current = touchY;
    }
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#fdf9f0] text-[#2a2620] relative select-none font-ko">
      {/* Background Watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.02]">
        <div className="font-en text-[22vw] font-bold uppercase tracking-[0.15em] text-[#8a6f2f] italic select-none">
          PRAISE
        </div>
      </div>


      {/* Twinkle Style Injection */}
      <style jsx global>{`
        @keyframes gold-twinkle {
          0%, 100% {
            color: #8a6f2f;
            text-shadow: 
              0 0 2px rgba(184, 154, 90, 0.1),
              0 0 4px rgba(184, 154, 90, 0.05);
          }
          50% {
            color: #c9a767;
            text-shadow: 
              0 0 8px rgba(255, 235, 175, 0.85),
              0 0 16px rgba(184, 154, 90, 0.65),
              0 0 24px rgba(184, 154, 90, 0.35);
          }
        }
        .animate-gold-twinkle {
          animation: gold-twinkle 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Main Grid Layout: Split screen left/right on all screen sizes */}
      <div className="grid grid-cols-[32%_68%] md:grid-cols-[40%_60%] lg:grid-cols-2 h-full w-full relative z-10">
        
        {/* Left Half: Fixed Year Display & Toggle */}
        <div 
          onWheel={handleLeftWheel}
          onTouchStart={handleLeftTouchStart}
          onTouchMove={handleLeftTouchMove}
          className="flex flex-col items-center justify-center border-r border-[rgba(184,154,90,0.12)] bg-[#fdf9f0]/40 backdrop-blur-[2px] relative p-3 md:p-12 cursor-ns-resize md:cursor-col-resize"
        >
          
          <span className="font-en text-[9px] md:text-[11px] uppercase tracking-[0.35em] text-[#8a6f2f] mb-3 md:mb-5">
            Choir Calendar
          </span>

          <div className="relative h-20 md:h-36 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeYear}
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -30, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="font-en italic font-bold text-[10vw] sm:text-[8vw] md:text-[10vw] leading-none text-[#8a6f2f] tracking-wide select-none"
              >
                {activeYear}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="w-12 h-[1px] bg-[#b89a5a]/30 my-4 md:my-6" />

          {/* Interactive Navigation/Toggle Buttons */}
          <div className="flex flex-col md:flex-row gap-5 md:gap-10 pointer-events-auto z-20 items-center">
            <button
              onClick={() => setActiveYear(scheduleYear)}
              className="group flex flex-col items-center focus:outline-none transition-transform duration-200 active:scale-95"
            >
              <span className={`font-en text-[16px] md:text-[20px] font-semibold transition-colors duration-300 ${
                activeYear === scheduleYear ? 'text-[#8a6f2f]' : 'text-[#9a8a70] hover:text-[#2a2620]'
              }`}>
                {scheduleYear}
              </span >
              <span className={`font-ko text-[11px] md:text-[12px] mt-1.5 tracking-wider transition-colors duration-300 ${
                activeYear === scheduleYear ? 'text-[#2a2620] font-bold' : 'text-[#9a8a70]'
              }`}>
                일정
              </span>
              <div className={`h-1.5 w-1.5 rounded-full bg-[#8a6f2f] mt-2 transition-all duration-300 ${
                activeYear === scheduleYear ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`} />
            </button>

            <button
              onClick={() => setActiveYear(reportYear)}
              className="group flex flex-col items-center focus:outline-none transition-transform duration-200 active:scale-95"
            >
              <span className={`font-en text-[16px] md:text-[20px] font-semibold transition-colors duration-300 ${
                activeYear === reportYear ? 'text-[#8a6f2f]' : 'text-[#9a8a70] hover:text-[#2a2620]'
              }`}>
                {reportYear}
              </span>
              <span className={`font-ko text-[11px] md:text-[12px] mt-1.5 tracking-wider transition-colors duration-300 ${
                activeYear === reportYear ? 'text-[#2a2620] font-bold' : 'text-[#9a8a70]'
              }`}>
                활동 보고
              </span>
              <div className={`h-1.5 w-1.5 rounded-full bg-[#8a6f2f] mt-2 transition-all duration-300 ${
                activeYear === reportYear ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Right/Bottom Half: Independent Scrollable Schedule List */}
        <div className="relative h-full w-full overflow-hidden bg-[#fdf9f0]">
          
          {/* Top Fade Mask */}
          <div className="absolute top-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-b from-[#fdf9f0] to-transparent pointer-events-none z-10" />

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="h-full w-full overflow-y-auto scrollbar-none pointer-events-auto px-8 md:px-20 lg:px-24 py-16 md:py-28"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeYear}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col pb-36"
              >
                {activeEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#6a5a40]/60">
                    <span className="text-[14px]">등록된 일정이 없습니다.</span>
                  </div>
                ) : (
                  activeEvents.map((event, index) => {
                    const isHighlight = event.highlight;
                    const status = computeStatus(event, today);

                    return (
                      <div
                        key={index}
                        className="group flex flex-col items-start justify-center py-14 md:py-20 border-b border-[rgba(184,154,90,0.12)] last:border-b-0"
                      >
                        {/* Date Label & Status Badge */}
                        <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-5">
                          <span className="font-ko font-bold text-[16px] md:text-[20px] text-[#2a2620] tracking-wide">
                            {event.when}
                          </span>
                          
                          {/* Progress Status Badges */}
                          {status.kind === 'done' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#9a8a70]/12 text-[#7c6c54] border border-[#9a8a70]/30 select-none">
                              완료
                            </span>
                          )}
                          {status.kind === 'tbd' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#d97706]/10 text-[#b25e00] border border-[#d97706]/20 select-none">
                              일정 미정
                            </span>
                          )}
                          {status.kind === 'upcoming' && status.days === 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#9d174d]/10 text-[#9d174d] border border-[#9d174d]/25 animate-pulse select-none">
                              오늘
                            </span>
                          )}
                          {status.kind === 'upcoming' && status.days > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#166534]/10 text-[#166534] border border-[#166534]/25 select-none">
                              D-{status.days}
                            </span>
                          )}
                        </div>

                        {/* Event Title */}
                        <h3 className={`font-ko text-[24px] md:text-[38px] lg:text-[44px] font-bold tracking-wide leading-snug transition-colors duration-300 ${
                          isHighlight ? 'animate-gold-twinkle' : 'text-[#2a2620] group-hover:text-[#b89a5a]'
                        }`}>
                          {event.title}
                        </h3>

                        {/* Event Detail */}
                        {event.detail && (
                          <p className="font-ko text-[14px] md:text-[16px] lg:text-[18px] text-[#6a5a40]/90 mt-5 leading-relaxed max-w-2xl">
                            {event.detail}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Fade Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-[#fdf9f0] to-transparent pointer-events-none z-10" />
        </div>

      </div>
    </main>
  );
}
