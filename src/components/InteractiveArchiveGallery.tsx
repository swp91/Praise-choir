'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import type { Photo } from '@/lib/types';

gsap.registerPlugin(Observer);

type Props = {
  photos: Photo[];
};

type ActivePhoto = {
  photo: Photo;
  rect: DOMRect;
};

const heightPattern = [300, 380, 330, 420, 310, 360, 440, 320, 390, 340];
const yPattern = [20, -16, 68, 4, 44, -6, 58, 14, -22, 36];

function tripled<T>(items: T[]) {
  return [...items, ...items, ...items];
}

export default function InteractiveArchiveGallery({ photos }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImageRef = useRef<HTMLImageElement>(null);
  const cardsRef = useRef<HTMLButtonElement[]>([]);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const setWidthRef = useRef(0);
  const [active, setActive] = useState<ActivePhoto | null>(null);
  const loopedPhotos = useMemo(() => tripled(photos), [photos]);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || photos.length === 0) return;

    const measure = () => {
      setWidthRef.current = track.scrollWidth / 3;
      positionRef.current = -setWidthRef.current;
      gsap.set(track, { x: positionRef.current });
    };

    const observer = Observer.create({
      target: viewport,
      type: 'wheel,touch,pointer',
      preventDefault: true,
      wheelSpeed: -1,
      onChangeX: (self) => {
        velocityRef.current += self.deltaX * 0.7;
      },
      onChangeY: (self) => {
        velocityRef.current += self.deltaY * 0.9;
      },
    });

    const tick = () => {
      const setWidth = setWidthRef.current;
      if (!setWidth) return;

      positionRef.current += velocityRef.current;
      velocityRef.current *= 0.9;

      if (positionRef.current < -setWidth * 2) positionRef.current += setWidth;
      if (positionRef.current > 0) positionRef.current -= setWidth;

      const lean = gsap.utils.clamp(-9, 9, velocityRef.current * 0.035);
      gsap.set(track, { x: positionRef.current });
      gsap.to(cardsRef.current, {
        rotateY: -lean,
        rotateZ: lean * 0.18,
        transformPerspective: 900,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: true,
      });
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    measure();
    gsap.ticker.add(tick);

    return () => {
      observer.kill();
      resizeObserver.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [photos.length]);

  useEffect(() => {
    if (!active || !overlayRef.current || !overlayImageRef.current) return;

    const overlay = overlayRef.current;
    const image = overlayImageRef.current;
    const targetWidth = Math.min(window.innerWidth * 0.68, 980);
    const sourceRatio = active.rect.width / active.rect.height;
    const targetHeight = Math.min(targetWidth / sourceRatio, window.innerHeight * 0.72);
    const finalWidth = targetHeight * sourceRatio;
    const finalLeft = (window.innerWidth - finalWidth) / 2;
    const finalTop = (window.innerHeight - targetHeight) / 2;

    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set(image, {
      left: active.rect.left,
      top: active.rect.top,
      width: active.rect.width,
      height: active.rect.height,
    });
    gsap.fromTo(
      overlay,
      { backgroundColor: 'rgba(247,242,229,0)' },
      { backgroundColor: 'rgba(247,242,229,1)', duration: 0.28, ease: 'power2.out' },
    );
    gsap.to(image, {
      left: finalLeft,
      top: finalTop,
      width: finalWidth,
      height: targetHeight,
      duration: 0.85,
      ease: 'expo.out',
    });
  }, [active]);

  function openPhoto(photo: Photo, element: HTMLButtonElement) {
    const image = element.querySelector('img');
    if (!image) return;
    setActive({ photo, rect: image.getBoundingClientRect() });
  }

  function closePhoto() {
    if (!overlayRef.current) {
      setActive(null);
      return;
    }
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.26,
      ease: 'power2.out',
      onComplete: () => setActive(null),
    });
  }

  return (
    <section className="relative hidden min-h-[calc(100vh-64px)] overflow-hidden bg-cream px-0 py-8 min-[881px]:block">
      <div className="pointer-events-none relative z-20 mx-auto text-center">
        <h1 className="font-en text-[clamp(72px,9vw,150px)] font-bold leading-[0.78] tracking-normal text-ink">
          The Archive
        </h1>
        <p className="mt-5 font-ko text-[clamp(18px,2vw,30px)] font-bold tracking-normal text-ink">
          갤러리 · 함께한 순간들
        </p>
      </div>

      <div
        ref={viewportRef}
        className="absolute inset-x-0 top-[46%] z-10 h-[46vh] -translate-y-1/2 cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <div ref={trackRef} className="flex h-full w-max items-center gap-8 px-[12vw] will-change-transform">
          {loopedPhotos.map((photo, index) => {
            const originalIndex = index % photos.length;
            const height = heightPattern[originalIndex % heightPattern.length];
            const y = yPattern[originalIndex % yPattern.length];

            return (
              <button
                key={`${photo.id ?? photo.title}-${index}`}
                ref={(node) => {
                  if (node) cardsRef.current[index] = node;
                }}
                type="button"
                className="group relative shrink-0 overflow-hidden bg-card shadow-[0_18px_45px_rgba(42,38,32,0.12)] will-change-transform"
                style={{ transform: `translateY(${y}px)` }}
                onClick={(event) => openPhoto(photo, event.currentTarget)}
              >
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="block w-auto object-contain"
                    style={{ height }}
                    draggable={false}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-0 text-center font-en text-[11px] uppercase tracking-[0.3em] text-ink-mute">
        Scroll to browse
      </div>

      {active ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-active-title"
          className="fixed inset-0 z-[1000] opacity-0"
          onClick={closePhoto}
        >
          <button
            type="button"
            aria-label="닫기"
            className="absolute right-8 top-8 z-20 border border-line bg-card px-3 py-2 font-en text-[14px] text-ink"
            onClick={closePhoto}
          >
            Close
          </button>
          {active.photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={overlayImageRef}
              src={active.photo.url}
              alt={active.photo.title}
              className="fixed z-10 object-contain shadow-[0_28px_90px_rgba(42,38,32,0.22)]"
              onClick={(event) => event.stopPropagation()}
            />
          ) : null}
          <h2
            id="archive-active-title"
            className="absolute inset-x-0 bottom-10 z-20 text-center font-ko text-[18px] font-bold text-ink"
          >
            {active.photo.title}
          </h2>
        </div>
      ) : null}
    </section>
  );
}
