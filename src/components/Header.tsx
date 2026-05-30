'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import Crest from './Crest';
import { usePageTransition } from '@/lib/transition';

const PAGES = [
  { key: 'home',     href: '/',         en: 'Overview',     ko: '메인',   num: '01' },
  { key: 'members',  href: '/members',  en: 'Choristers',   ko: '대원',   num: '02' },
  { key: 'leaders',  href: '/leaders',  en: 'Serving Ministers', ko: '임원',   num: '03' },
  { key: 'practice', href: '/practice', en: 'Hours & Aims', ko: '연습 및 목표', num: '04' },
  { key: 'events',   href: '/events',   en: 'Calendar',     ko: '일정',   num: '05' },
  { key: 'gallery',  href: '/gallery',  en: 'Archive',      ko: '갤러리', num: '06' },
] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  
  const overlayRef = useRef<HTMLDivElement>(null);

  // 스크롤 감지하여 헤더 투명도 조절 (마이크로 인터랙션)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP 풀스크린 오버레이 애니메이션 오케스트레이션
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // 1. 오버레이 컨테이너 등장 애니메이션
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(253, 249, 240, 0)' },
        { opacity: 1, backdropFilter: 'blur(24px)', backgroundColor: 'rgba(253, 249, 240, 0.98)', duration: 0.3, ease: 'power2.out' }
      );

      // 2. 메뉴 아이템 순차 스태거 등장 (인스턴트 페이드 인)
      const items = overlayRef.current?.querySelectorAll('.menu-item');
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out', delay: 0 }
        );
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 메뉴 닫기 애니메이션 실행 후 state 변경
  const handleClose = () => {
    const items = overlayRef.current?.querySelectorAll('.menu-item');
    if (items && items.length > 0) {
      gsap.to(items, {
        opacity: 0,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.in',
      });
    }

    gsap.to(overlayRef.current, {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      backgroundColor: 'rgba(253, 249, 240, 0)',
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 0.08,
      onComplete: () => {
        setIsOpen(false);
      },
    });
  };

  const handleLinkClick = (href: string) => {
    if (href === pathname) {
      handleClose();
      return;
    }
    // 페이지 전환 뷰를 덮는 vellum sheet 모션이 실행되기 전에 메뉴를 닫아 스냅감을 줍니다.
    setIsOpen(false);
    document.body.style.overflow = '';
    navigate(href);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* 1. 중앙 상단 플로팅 글래스모피즘 헤더 바 */}
      <header
        className={`fixed z-[999] w-[90%] max-w-[260px] transition-all duration-300 rounded-full flex items-center justify-between border border-line-soft/40 shadow-[0_8px_24px_rgba(42,38,32,0.04)] right-4 md:right-8 lg:right-12 ${
          isScrolled
            ? 'top-1.5 h-13 bg-cream/45 backdrop-blur-md px-4 shadow-[0_12px_32px_rgba(42,38,32,0.06)] border-line-soft/60'
            : 'top-3 h-15 bg-cream/25 backdrop-blur-sm px-5'
        }`}
      >
        {/* 좌측: 로고와 브랜드 타이틀 */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="flex items-center gap-2.5 group select-none"
        >
          <div className="w-7 h-7 shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Crest />
          </div>
          <span className="font-en text-[11px] md:text-[12px] font-bold tracking-[0.24em] uppercase text-ink leading-none pt-0.5">
            Praise
          </span>
        </Link>

        {/* 우측: 프리미엄 햄버거 토글러 */}
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              handleClose();
            } else {
              setIsOpen(true);
            }
          }}
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          className="relative z-[1000] w-8 h-8 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer group select-none"
        >
          <div className="w-5 h-3 flex flex-col justify-between items-end relative">
            <span
              className={`h-[1.5px] bg-ink rounded-full transition-all duration-300 origin-center ${
                isOpen ? 'w-5 absolute top-1.5 rotate-45' : 'w-5'
              }`}
            />
            <span
              className={`h-[1.5px] bg-ink rounded-full transition-all duration-300 origin-center ${
                isOpen ? 'w-5 absolute top-1.5 -rotate-45' : 'w-3.5 group-hover:w-5'
              }`}
            />
          </div>
        </button>
      </header>

      {/* 2. GSAP 연동 풀스크린 내비게이션 오버레이 */}
      {isOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[998] flex flex-col justify-center items-start pl-10 md:pl-28 lg:pl-36 overflow-hidden"
        >
          {/* 장식용 은은한 성가대 배경 워터마크 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max text-center pointer-events-none select-none opacity-[0.02] z-0 font-en font-bold italic tracking-[0.2em] text-[16vw] uppercase leading-none">
            SANCTUS
            <br />
            GLORIA
          </div>

          <nav className="relative z-10 w-full pr-12">
            <ul className="flex flex-col gap-3 md:gap-4">
              {PAGES.map((p) => {
                const active = isActive(p.href);
                return (
                  <li key={p.key} className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => handleLinkClick(p.href)}
                      className={`menu-item group flex items-baseline gap-3.5 md:gap-5 font-en text-[clamp(28px,4.8vw,54px)] uppercase tracking-[0.04em] transition-all duration-300 select-none bg-transparent border-0 p-0 text-left cursor-pointer whitespace-nowrap ${
                        active
                          ? 'text-gold-deep font-semibold'
                          : 'text-ink hover:text-gold'
                      }`}
                    >
                      {/* 순번 표시 */}
                      <span className="font-en italic text-gold/60 text-[clamp(16px,2vw,22px)] group-hover:text-gold transition-colors duration-300">
                        {p.num}
                      </span>
                      {/* 영어 타이틀 */}
                      <span className="font-semibold">{p.en}</span>
                      {/* 한국어 타이틀 */}
                      <span className="font-ko text-[clamp(16px,1.8vw,21px)] text-ink-soft ml-2.5 md:ml-4 tracking-normal normal-case font-medium group-hover:text-gold-deep transition-colors duration-300">
                        {p.ko}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 하단 푸터 데코레이션 */}
          <div className="absolute bottom-10 left-10 md:left-28 lg:left-36 select-none z-10 pointer-events-none text-left">
            <div className="font-en italic text-[11px] tracking-[0.24em] text-ink-mute uppercase">
              PRAISE CHOIR · A.D. MMXXVI
            </div>
          </div>
        </div>
      )}
    </>
  );
}
