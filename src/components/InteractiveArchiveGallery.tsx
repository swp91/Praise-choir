'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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

function FadeInImage({ photo, height }: { photo: Photo; height: number }) {
  const [loaded, setLoaded] = useState(false);

  const hasPalette = photo.palette && photo.palette.length >= 3;
  const bg = hasPalette
    ? `linear-gradient(135deg, ${photo.palette[0]} 0%, ${photo.palette[1]} 60%, ${photo.palette[2]} 100%)`
    : 'rgba(184, 154, 90, 0.05)';

  // 로딩 전에는 3:2 가로형 비율(height * 1.5)을 임시 너비로 두어 레이아웃 시프트 방지
  const tempWidth = height * 1.5;

  return (
    <div className="relative overflow-hidden" style={{ height, width: loaded ? 'auto' : tempWidth }}>
      {!loaded && (
        <div 
          className="absolute inset-0 animate-pulse opacity-30" 
          style={{ background: bg }}
        />
      )}
      <img
        src={photo.url}
        alt={photo.title}
        onLoad={() => setLoaded(true)}
        className={`block w-auto object-contain transition-opacity duration-700 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ height }}
        draggable={false}
      />
    </div>
  );
}

const heightPattern = [300, 380, 330, 420, 310, 360, 440, 320, 390, 340];

function tripled<T>(items: T[]) {
  return [...items, ...items, ...items];
}

function targetRect(sourceRect: DOMRect) {
  const targetWidth = Math.min(window.innerWidth * 0.68, 980);
  const sourceRatio = sourceRect.width / sourceRect.height;
  const targetHeight = Math.min(targetWidth / sourceRatio, window.innerHeight * 0.72);
  const width = targetHeight * sourceRatio;

  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - targetHeight) / 2,
    width,
    height: targetHeight,
  };
}

export default function InteractiveArchiveGallery({ photos }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<HTMLSpanElement[]>([]);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const setWidthRef = useRef(0);
  const closingRef = useRef(false);
  const [active, setActive] = useState<ActivePhoto | null>(null);
  const loopedPhotos = useMemo(() => tripled(photos), [photos]);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || photos.length === 0) return;

    // 마운트되거나 새 사진 목록이 로드될 때 너비 기준값을 초기화하여 오작동 방지
    setWidthRef.current = 0;

    const measure = () => {
      const newSetWidth = track.scrollWidth / 3;
      if (!newSetWidth || isNaN(newSetWidth)) return;

      const oldSetWidth = setWidthRef.current;
      setWidthRef.current = newSetWidth;

      if (!oldSetWidth || isNaN(oldSetWidth)) {
        positionRef.current = -newSetWidth;
      } else {
        // 비례 곱셈식을 제거하고 절대 스크롤 좌표를 유지합니다.
        // 바뀐 트랙 크기에 맞춰 무한 루프 범위(-newSetWidth * 2 ~ 0) 내로만 회수합니다.
        while (positionRef.current < -newSetWidth * 2) {
          positionRef.current += newSetWidth;
        }
        while (positionRef.current > 0) {
          positionRef.current -= newSetWidth;
        }
      }
      gsap.set(track, { x: positionRef.current });
    };

    const observer = Observer.create({
      target: viewport,
      type: 'wheel,touch,pointer',
      preventDefault: true,
      wheelSpeed: -1,
      onChangeX: (self) => {
        velocityRef.current += self.deltaX * 0.055;
      },
      onChangeY: (self) => {
        velocityRef.current += self.deltaY * 0.075;
      },
    });

    const tick = () => {
      const setWidth = setWidthRef.current;
      if (!setWidth) return;

      positionRef.current += velocityRef.current;
      velocityRef.current *= 0.8;

      while (positionRef.current < -setWidth * 2) positionRef.current += setWidth;
      while (positionRef.current > 0) positionRef.current -= setWidth;

      const lean = gsap.utils.clamp(-14, 14, velocityRef.current * 0.32);
      gsap.set(track, { x: positionRef.current });
      gsap.to(photoRefs.current, {
        rotateY: lean, // 물리적 관성 및 바람 저항 방향과 직관적으로 일치하도록 부호 반전
        rotateZ: -lean * 0.24,
        transformPerspective: 700,
        transformOrigin: 'center center',
        duration: 0.28,
        ease: 'power3.out',
        overwrite: true,
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      // 3D 회전 애니메이션 중(스크롤 속도가 있을 때)에는 너비 변화 측정을 스킵하여 튕김 현상 방지
      if (Math.abs(velocityRef.current) < 0.05) {
        measure();
      }
    });
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
    const title = titleRef.current;
    const controls = controlsRef.current;
    const target = targetRect(active.rect);

    closingRef.current = false;
    gsap.killTweensOf([overlay, image]);
    if (title) gsap.killTweensOf(title);
    if (controls) gsap.killTweensOf(controls);

    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set(image, {
      left: active.rect.left,
      top: active.rect.top,
      width: active.rect.width,
      height: active.rect.height,
    });
    if (title) {
      gsap.set(title, { autoAlpha: 0, y: 15 });
    }
    if (controls) {
      gsap.set(controls, { autoAlpha: 0 });
    }

    const tl = gsap.timeline();
    tl.fromTo(
      overlay,
      { backgroundColor: 'rgba(247,242,229,0)' },
      { backgroundColor: 'rgba(247,242,229,1)', duration: 0.5, ease: 'power2.out' },
    ).to(image, {
      left: target.left,
      top: target.top,
      width: target.width,
      height: target.height,
      duration: 0.85,
      ease: 'expo.out',
    }, 0.3);

    if (title) {
      tl.to(title, {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
      }, 0.95); // Starts 0.2s before the image finishes scaling
    }

    if (controls) {
      tl.to(controls, {
        autoAlpha: 1,
        duration: 0.45,
        ease: 'power2.out',
      }, 0.3); // Fades in with the background
    }
  }, [active]);

  function openPhoto(photo: Photo, element: HTMLButtonElement) {
    const image = element.querySelector('img');
    if (!image) return;
    setActive({ photo, rect: image.getBoundingClientRect() });

    if (typeof window !== 'undefined') {
      const idStr = String(photo.id || photo.title).replace(/[^a-zA-Z0-9-_]/g, '');
      window.history.pushState({ photoId: photo.id || photo.title }, '', `#photo-${idStr}`);
    }
  }

  const closePhoto = useCallback((isFromPopstate = false) => {
    if (closingRef.current) return;
    if (!active || !overlayRef.current || !overlayImageRef.current) {
      setActive(null);
      return;
    }

    if (!isFromPopstate && typeof window !== 'undefined' && window.location.hash.startsWith('#photo-')) {
      window.history.back();
      return;
    }

    closingRef.current = true;
    const overlay = overlayRef.current;
    const image = overlayImageRef.current;
    const title = titleRef.current;
    const controls = controlsRef.current;
    gsap.killTweensOf([overlay, image]);
    if (title) gsap.killTweensOf(title);
    if (controls) gsap.killTweensOf(controls);

    const tl = gsap.timeline({
      onComplete: () => {
        closingRef.current = false;
        setActive(null);
      },
    });

    if (title) {
      tl.to(title, {
        autoAlpha: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.out',
      }, 0);
    }

    if (controls) {
      tl.to(controls, {
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power2.out',
      }, 0);
    }

    tl.to(image, {
      left: active.rect.left,
      top: active.rect.top,
      width: active.rect.width,
      height: active.rect.height,
      duration: 0.68,
      ease: 'expo.inOut',
    }, 0)
    .to(overlay, {
      backgroundColor: 'rgba(247,242,229,0)',
      duration: 0.45,
      ease: 'power2.out',
    }, 0.4);
  }, [active]);

  // Handle hardware back/gesture popstate events
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { photoId?: string } | null;
      if (!state || !state.photoId) {
        closePhoto(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [closePhoto]);

  // Clean up url hash on initial reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.startsWith('#photo-')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  return (
    <section className="relative hidden h-screen flex-col justify-between bg-cream px-0 pt-20 pb-8 overflow-hidden min-[881px]:flex">
      {/* 백그라운드 흘러가는 성가대 아카이브 라틴어 마키 연출 (일관성 확보) */}
      <div className="absolute top-8 left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
              GALLERIA · MEMORIA
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mx-auto text-center shrink-0">
        <h1 className="font-en text-[clamp(44px,5.2vw,72px)] font-bold leading-[0.85] tracking-normal text-ink">
          The Gallery
        </h1>
        <p className="mt-4 font-ko text-[clamp(13px,1.5vw,17px)] font-medium tracking-normal text-ink-soft">
          갤러리 · 함께한 순간들
        </p>
      </div>

      <div
        ref={viewportRef}
        className="relative z-10 w-full flex-1 flex items-center h-[46vh] my-4 cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <div ref={trackRef} className="flex h-full w-max items-center gap-8 px-[4vw] will-change-transform">
          {loopedPhotos.map((photo, index) => {
            const originalIndex = index % photos.length;
            const height = heightPattern[originalIndex % heightPattern.length];

            return (
              <button
                key={`${photo.id ?? photo.title}-${index}`}
                type="button"
                className="group relative flex h-full shrink-0 items-center overflow-visible bg-transparent will-change-transform"
                onClick={(event) => openPhoto(photo, event.currentTarget)}
              >
                {photo.url ? (
                  <span
                    ref={(node) => {
                      if (node) photoRefs.current[index] = node;
                    }}
                    className="relative block overflow-hidden bg-card shadow-[0_18px_45px_rgba(42,38,32,0.12)] will-change-transform"
                  >
                    <FadeInImage photo={photo} height={height} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none w-full text-center shrink-0 z-10 font-en text-[10px] uppercase tracking-[0.32em] text-ink-mute mt-2">
        Scroll to browse
      </div>

      {active ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-active-title"
          className="fixed inset-0 z-[1000] opacity-0"
          onClick={() => closePhoto()}
        >
          <div ref={controlsRef} className="absolute right-8 top-8 z-20 flex gap-2 opacity-0">
            {active.photo.url ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const url = active.photo.url!;
                  const ext = url.split(/[#?]/)[0].split('.').pop() || 'jpg';
                  const filename = `${active.photo.title.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ') || 'image'}.${ext}`;
                  
                  fetch(url)
                    .then(res => res.blob())
                    .then(blob => {
                      const blobUrl = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = blobUrl;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(blobUrl);
                    })
                    .catch(err => {
                      console.error(err);
                      window.open(url, '_blank');
                    });
                }}
                className="border border-line bg-card px-3 py-2 font-en text-[14px] text-ink transition hover:border-gold cursor-pointer"
              >
                Download
              </button>
            ) : null}
            <button
              type="button"
              aria-label="닫기"
              className="border border-line bg-card px-3 py-2 font-en text-[14px] text-ink transition hover:border-gold"
              onClick={(event) => {
                event.stopPropagation();
                closePhoto();
              }}
            >
              Close
            </button>
          </div>
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
          <div
            ref={titleRef}
            className="absolute inset-x-0 z-20 text-center font-ko pointer-events-none select-none opacity-0"
            style={{
              top: active ? `${targetRect(active.rect).top + targetRect(active.rect).height + 24}px` : 'auto'
            }}
          >
            <h2
              id="gallery-active-title"
              className="text-[24px] md:text-[28px] font-bold text-ink leading-snug"
            >
              {active.photo.title}
            </h2>
            {active.photo.date ? (
              <p className="font-en italic text-gold-deep text-[13px] md:text-[14px] mt-1.5">
                {active.photo.date}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
