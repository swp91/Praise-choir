"use client";
import { useState } from "react";
import TimelineItem from "./TimelineItem";
import Timeline2026 from "./Timeline2026";
import { CHOIR_DATA } from "@/lib/data";
import type { ChoirEvent } from "@/lib/types";

export default function YearToggle() {
  const [year, setYear] = useState<"2026" | "2025">("2026");

  return (
    <>
      <div className="relative grid grid-cols-2 border border-gold w-fit mb-4 overflow-hidden">
        {/* Sliding indicator */}
        <div
          className={`absolute inset-y-0 w-1/2 bg-ink transition-transform duration-300 ease-in-out ${
            year === "2025" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <button
          type="button"
          aria-pressed={year === "2026"}
          className={`relative z-10 font-ko text-[13px] px-5.5 py-3 border-r border-line-soft bg-transparent transition-colors duration-300 ${
            year === "2026" ? "text-cream" : "text-ink-soft"
          }`}
          onClick={() => setYear("2026")}
        >
          2026 일정
        </button>
        <button
          type="button"
          aria-pressed={year === "2025"}
          className={`relative z-10 font-ko text-[13px] px-5.5 py-3 bg-transparent transition-colors duration-300 ${
            year === "2025" ? "text-cream" : "text-ink-soft"
          }`}
          onClick={() => setYear("2025")}
        >
          2025 보고
        </button>
      </div>

      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">
            {year === "2026"
              ? "2026 행사 예정 · Timeline"
              : "2025 Events · Concluded"}
          </h3>
          <div>
            <span className="block w-1.5 h-1.5 bg-gold rounded-full" />
          </div>
        </div>

        {year === "2026" ? (
          <Timeline2026 events={CHOIR_DATA.events2026 as ChoirEvent[]} />
        ) : (
          <div className="py-2">
            {CHOIR_DATA.events2025.map((e, i) => (
              <TimelineItem key={i} event={e} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
