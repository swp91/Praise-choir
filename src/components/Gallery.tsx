'use client';
import { useState, useEffect, useRef } from 'react';
import type { Photo } from '@/lib/types';

const RATIOS = [
  'aspect-16/9',
  'aspect-3/4',
  'aspect-1/1',
  'aspect-3/4',
  'aspect-4/3',
  'aspect-4/3',
  'aspect-3/4',
  'aspect-16/9',
  'aspect-3/4',
  'aspect-1/1',
  'aspect-16/9',
  'aspect-3/4',
  'aspect-4/3',
  'aspect-3/4',
  'aspect-1/1',
];

function Placeholder({ photo }: { photo: Photo }) {
  if (photo.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
    );
  }

  const [c1, c2, c3] = photo.palette;
  const bg = `linear-gradient(135deg, ${c1} 0%, ${c2} 60%, ${c3} 100%)`;
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute inset-0 bg-linear-to-b from-[rgba(45,36,24,0.05)] to-[rgba(45,36,24,0.4)]" />
      <div className="relative w-15 h-15 border border-white/55 rounded-full flex items-center justify-center bg-[rgba(45,36,24,0.18)] backdrop-blur-sm after:content-[''] after:absolute after:inset-1 after:border after:border-white/30 after:rounded-full">
        <span className="font-en italic text-[11px] tracking-widest text-white/95">{photo.motif}</span>
      </div>
      <div className="absolute bottom-2.5 left-3 right-3 font-en text-[9px] tracking-[0.18em] text-white/85 uppercase">
        — {photo.date} · Praise Choir —
      </div>
    </div>
  );
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <>
      {photos.length === 0 && (
        <div className="bg-card border border-line px-6 py-12 text-center">
          <div className="font-ko text-[15px] font-bold text-ink">아직 등록된 사진이 없습니다.</div>
          <div className="font-ko text-[12px] text-ink-soft mt-2">관리자 페이지에서 갤러리 사진을 업로드하면 이곳에 표시됩니다.</div>
        </div>
      )}

      <div className="columns-3 gap-4 max-[880px]:columns-2 max-[880px]:gap-2.5">
        {photos.map((p, i) => (
          <div key={p.title} className="break-inside-avoid mb-4 max-[880px]:mb-2.5">
            <button
              type="button"
              className="w-full bg-card border border-line-soft p-2.5 cursor-pointer transition-all duration-250 hover:border-gold hover:-translate-y-0.5 text-left block"
              onClick={() => setActive(p)}
            >
              <div className={`relative overflow-hidden ${RATIOS[i % RATIOS.length]}`}>
                <Placeholder photo={p} />
              </div>
              <div className="pt-2.5 px-1 pb-1 flex justify-between gap-3 items-baseline">
                <span className="font-ko text-[13px] font-bold">{p.title}</span>
                <span className="font-en italic text-[11px] text-gold-deep [font-variant-numeric:tabular-nums]">{p.date}</span>
              </div>
            </button>
          </div>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-modal-title"
          className="fixed inset-0 bg-[rgba(45,36,24,0.92)] backdrop-blur-sm z-200 flex items-center justify-center p-6"
          onClick={e => { if (e.target === e.currentTarget) setActive(null); }}
        >
          <div className="max-w-200 w-full bg-card border border-gold p-3.5 relative">
            <button
              ref={closeRef}
              type="button"
              aria-label="닫기"
              className="absolute -top-9.5 right-0 bg-transparent border border-white/50 text-white/95 w-8 h-8 cursor-pointer font-en text-[18px]"
              onClick={() => setActive(null)}
            >×</button>
            <div className="aspect-4/3 relative overflow-hidden"><Placeholder photo={active} /></div>
            <div className="pt-3.5 px-1.5 pb-1 text-center">
              <h3 id="gallery-modal-title" className="font-ko text-[20px] font-bold mb-1">{active.title}</h3>
              <p className="font-en italic text-gold-deep">{active.date}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
