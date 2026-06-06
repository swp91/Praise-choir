'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChoirEvent } from '@/lib/types';

interface EventsSplitClientProps {
  scheduleYear: number;
  reportYear: number;
  scheduleEvents: ChoirEvent[];
  reportEvents: ChoirEvent[];
}

export default function EventsSplitClient({
  scheduleYear,
  reportYear,
  scheduleEvents,
  reportEvents,
}: EventsSplitClientProps) {
  const [activeYear, setActiveYear] = useState<number>(scheduleYear);

  // Get active list of events based on year
  const activeEvents = activeYear === scheduleYear ? scheduleEvents : reportEvents;

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#fdf9f0] text-[#2a2620] relative select-none font-ko">
      {/* Background Watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.02]">
        <div className="font-en text-[22vw] font-bold uppercase tracking-[0.15em] text-[#8a6f2f] italic select-none">
          PRAISE
        </div>
      </div>

      {/* Floating Home Back Button */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="font-ko text-[12px] font-medium tracking-wide text-[#2a2620] hover:text-[#b89a5a] transition-colors duration-300 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[rgba(184,154,90,0.18)] bg-[#fdf9f0]/60 backdrop-blur-sm shadow-sm"
        >
          <span>←</span> 홈으로
        </Link>
      </div>

      {/* Main Grid Layout: Split screen 50:50 */}
      <div className="grid grid-cols-1 grid-rows-[50vh_50vh] md:grid-cols-2 md:grid-rows-1 h-full w-full relative z-10">
        
        {/* Left/Top Half: Fixed Year Display & Toggle */}
        <div className="flex flex-col items-center justify-center border-b border-[rgba(184,154,90,0.12)] md:border-b-0 md:border-r md:border-[rgba(184,154,90,0.12)] bg-[#fdf9f0]/40 backdrop-blur-[2px] relative p-6 md:p-12">
          
          <span className="font-en text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#8a6f2f] mb-3 md:mb-5">
            Choir Calendar
          </span>

          <div className="relative h-24 md:h-36 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeYear}
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -30, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="font-en italic font-bold text-[18vw] md:text-[10vw] leading-none text-[#8a6f2f] tracking-wide select-none"
              >
                {activeYear}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="w-12 h-[1px] bg-[#b89a5a]/30 my-4 md:my-6" />

          {/* Interactive Navigation/Toggle Buttons */}
          <div className="flex gap-8 md:gap-10 pointer-events-auto z-20">
            <button
              onClick={() => setActiveYear(scheduleYear)}
              className="group flex flex-col items-center focus:outline-none transition-transform duration-200 active:scale-95"
            >
              <span className={`font-en text-[18px] md:text-[20px] font-semibold transition-colors duration-300 ${
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
              <span className={`font-en text-[18px] md:text-[20px] font-semibold transition-colors duration-300 ${
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
          <div className="h-full w-full overflow-y-auto scrollbar-none pointer-events-auto px-6 py-16 md:px-16 md:py-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeYear}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-8 md:gap-12 pb-16 md:pb-24"
              >
                {activeEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#6a5a40]/60">
                    <span className="text-[14px]">등록된 일정이 없습니다.</span>
                  </div>
                ) : (
                  activeEvents.map((event, index) => {
                    const isHighlight = event.highlight;

                    return (
                      <div
                        key={index}
                        className="group flex items-start gap-4 md:gap-6 transition-all duration-300 hover:translate-x-1.5"
                      >
                        {/* Date column */}
                        <div className="w-16 md:w-24 shrink-0 pt-0.5">
                          <span className={`font-en italic font-medium text-[13px] md:text-[15px] tracking-wide transition-colors duration-300 ${
                            isHighlight ? 'text-[#8a6f2f] font-bold' : 'text-[#6a5a40] group-hover:text-[#2a2620]'
                          }`}>
                            {event.when}
                          </span>
                        </div>

                        {/* Connection indicator */}
                        <div className="flex flex-col items-center pt-2">
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            isHighlight
                              ? 'bg-[#8a6f2f] scale-125 ring-4 ring-[#b89a5a]/20'
                              : 'bg-[#d4c4a0] group-hover:bg-[#8a6f2f] group-hover:scale-110'
                          }`} />
                        </div>

                        {/* Title and Detail */}
                        <div className="flex-1">
                          <h3 className={`text-[16px] md:text-[18px] font-bold tracking-wide transition-colors duration-300 ${
                            isHighlight ? 'text-[#8a6f2f]' : 'text-[#2a2620] group-hover:text-[#b89a5a]'
                          }`}>
                            {event.title}
                          </h3>
                          {event.detail && (
                            <p className="text-[12px] md:text-[13px] text-[#6a5a40]/85 mt-1 leading-relaxed max-w-xl">
                              {event.detail}
                            </p>
                          )}
                        </div>
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
