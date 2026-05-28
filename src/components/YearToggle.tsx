"use client";
import { useState } from "react";
import TimelineItem from "./TimelineItem";
import Timeline2026 from "./Timeline2026";
import type { ChoirEvent } from "@/lib/types";

type Props = {
  scheduleYear: number;
  reportYear: number;
  scheduleEvents: ChoirEvent[];
  reportEvents: ChoirEvent[];
};

export default function YearToggle({ scheduleYear, reportYear, scheduleEvents, reportEvents }: Props) {
  const scheduleKey = String(scheduleYear);
  const reportKey = String(reportYear);
  const [year, setYear] = useState(scheduleKey);

  return (
    <>
      <div className="relative grid grid-cols-2 border border-gold w-fit mb-4 overflow-hidden">
        {/* Sliding indicator */}
        <div
          className={`absolute inset-y-0 w-1/2 bg-ink transition-transform duration-300 ease-in-out ${
            year === reportKey ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <button
          type="button"
          aria-pressed={year === scheduleKey}
          className={`relative z-10 font-ko text-[13px] px-5.5 py-3 border-r border-line-soft bg-transparent transition-colors duration-300 ${
            year === scheduleKey ? "text-cream" : "text-ink-soft"
          }`}
          onClick={() => setYear(scheduleKey)}
        >
          {scheduleYear} 일정
        </button>
        <button
          type="button"
          aria-pressed={year === reportKey}
          className={`relative z-10 font-ko text-[13px] px-5.5 py-3 bg-transparent transition-colors duration-300 ${
            year === reportKey ? "text-cream" : "text-ink-soft"
          }`}
          onClick={() => setYear(reportKey)}
        >
          {reportYear} 보고
        </button>
      </div>

      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">
            {year === scheduleKey
              ? `${scheduleYear} 행사 예정 · Timeline`
              : `${reportYear} Events · Concluded`}
          </h3>
          <div>
            <span className="block w-1.5 h-1.5 bg-gold rounded-full" />
          </div>
        </div>

        {year === scheduleKey ? (
          <Timeline2026 events={scheduleEvents} />
        ) : (
          <div className="py-2">
            {reportEvents.map((e, i) => (
              <TimelineItem key={i} event={e} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
