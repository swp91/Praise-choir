'use client';
import { useState, useEffect } from 'react';
import type { Photo } from '@/lib/types';
import InteractiveArchiveGallery from './InteractiveArchiveGallery';

function Placeholder({ photo }: { photo: Photo }) {
  if (photo.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo.url} alt={photo.title} className="block h-auto w-full" />
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
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  const openPhoto = (photo: Photo) => {
    setActive(photo);
    if (typeof window !== 'undefined') {
      const idStr = String(photo.id || photo.title).replace(/[^a-zA-Z0-9-_]/g, '');
      window.history.pushState({ photoId: photo.id || photo.title }, '', `#photo-${idStr}`);
    }
  };

  const closePhoto = () => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#photo-')) {
      window.history.back();
    } else {
      setActive(null);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePhoto(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  // Clean up URL hash on initial reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.startsWith('#photo-')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  // Handle hardware/gesture popstate events
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { photoId?: string } | null;
      if (state && state.photoId) {
        const found = photos.find(p => (p.id || p.title) === state.photoId);
        if (found) setActive(found);
      } else {
        setActive(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [photos]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 881);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {photos.length === 0 && (
        <div className="bg-card border border-line px-6 py-12 text-center">
          <div className="font-ko text-[15px] font-bold text-ink">아직 등록된 사진이 없습니다.</div>
          <div className="font-ko text-[12px] text-ink-soft mt-2">관리자 페이지에서 갤러리 사진을 업로드하면 이곳에 표시됩니다.</div>
        </div>
      )}

      {photos.length > 0 && isDesktop === true ? <InteractiveArchiveGallery photos={photos} /> : null}

      {photos.length > 0 && isDesktop === false ? (
        <div className="columns-2 gap-2.5 min-[720px]:columns-3">
          {photos.map((p, i) => (
            <div key={p.id ?? `${p.title}-${i}`} className="mb-2.5 break-inside-avoid">
              <button
                type="button"
                className="group w-full bg-card border border-line-soft p-1.5 cursor-pointer transition-all duration-250 hover:border-gold text-left block"
                onClick={() => openPhoto(p)}
              >
                <div className="relative overflow-hidden">
                  <Placeholder photo={p} />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/75 to-transparent px-3 pb-2.5 pt-12 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="block font-ko text-[12px] font-bold leading-snug text-cream">{p.title}</span>
                    {p.date ? (
                      <span className="mt-0.5 block font-en italic text-[10px] text-cream/80 [font-variant-numeric:tabular-nums]">
                        {p.date}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-modal-title"
          className="fixed inset-0 bg-cream/95 backdrop-blur-sm z-200 flex items-center justify-center p-6"
          onClick={e => { if (e.target === e.currentTarget) closePhoto(); }}
        >
          <div className="max-w-200 w-full bg-card border border-gold p-3.5 relative">
            <div className="relative max-h-[72vh] overflow-hidden">
              {active.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.url} alt={active.title} className="mx-auto block max-h-[68vh] w-full h-auto object-contain" />
              ) : (
                <Placeholder photo={active} />
              )}
            </div>
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
