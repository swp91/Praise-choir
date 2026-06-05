'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import Crest from './Crest';
import { usePageTransition } from '@/lib/transition';
import { motion } from 'framer-motion';

const PAGES = [
  { key: 'home',     href: '/',         en: 'Overview',     ko: '메인',   num: '01' },
  { key: 'members',  href: '/members',  en: 'Choristers',   ko: '대원',   num: '02' },
  { key: 'leaders',  href: '/leaders',  en: 'Officers', ko: '임원',   num: '03' },
  { key: 'practice', href: '/practice', en: 'Hours & Aims', ko: '연습 및 목표', num: '04' },
  { key: 'events',   href: '/events',   en: 'Calendar',     ko: '일정',   num: '05' },
  { key: 'gallery',  href: '/gallery',  en: 'Archive',      ko: '갤러리', num: '06' },
] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  const [isIntroRunning, setIsIntroRunning] = useState(false);
  
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

  // 인트로 진행 상태에 따른 헤더 노출 타이밍 연동
  useEffect(() => {
    if (pathname !== '/') {
      setTimeout(() => setIsIntroRunning(false), 0);
      return;
    }

    // 이미 인트로를 본 적이 있다면 대기 없이 즉시 노출
    if (typeof window !== 'undefined' && (window as unknown as { __hasSeenIntro?: boolean }).__hasSeenIntro) {
      setTimeout(() => setIsIntroRunning(false), 0);
      return;
    }

    // 메인 홈 화면에서는 인트로 완료 이벤트를 수신하기 전까지 대기
    setTimeout(() => setIsIntroRunning(true), 0);

    const handleIntroComplete = () => {
      setIsIntroRunning(false);
    };

    window.addEventListener('intro-complete', handleIntroComplete);

    // 이벤트 유실 대비 백업용 타임아웃 (8초 후 강제 노출)
    const fallbackId = setTimeout(() => {
      setIsIntroRunning(false);
    }, 8000);

    return () => {
      window.removeEventListener('intro-complete', handleIntroComplete);
      clearTimeout(fallbackId);
    };
  }, [pathname]);

  // GSAP 풀스크린 오버레이 애니메이션 오케스트레이션
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // 1. 오버레이 컨테이너 등장 애니메이션 (포인터 이벤트 차단으로 호버 간섭 방지)
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, pointerEvents: 'none' },
        {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(overlayRef.current, { clearProps: 'opacity,pointerEvents' });
          }
        }
      );

      // 2. 메뉴 아이템 순차 스태거 등장 (물리엔진 탄력적 튀어나오기 + 포인터 차단 + inline style 제거로 서브픽셀 복원)
      const items = overlayRef.current?.querySelectorAll('.menu-item');
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, yPercent: 120, pointerEvents: 'none' },
          {
            opacity: 1,
            yPercent: 0,
            pointerEvents: 'auto',
            duration: 0.55,
            stagger: 0.04,
            ease: 'back.out(1.4)',
            delay: 0,
            onComplete: () => {
              gsap.set(items, { clearProps: 'opacity,yPercent,pointerEvents' });
            }
          }
        );
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // 메뉴 닫기 애니메이션 실행 후 state 변경
  const handleClose = () => {
    const items = overlayRef.current?.querySelectorAll('.menu-item');
    if (items && items.length > 0) {
      gsap.to(items, {
        opacity: 0,
        yPercent: 100,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.in',
      });
    }

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
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
    document.documentElement.style.overflow = '';
    navigate(href);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // 개별 글자 단위 슬롯머신 호버 애니메이션 (진입)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (btn.getAttribute('data-active') === 'true') return; // 활성 페이지 메뉴는 호버 롤링 비활성화 (앵커 고정)
    
    const defaults = btn.querySelectorAll('.char-default');
    const hovers = btn.querySelectorAll('.char-hover');
    
    gsap.killTweensOf([defaults, hovers]);
    
    // 기본 글자는 위로 밀려 사라짐 (탄력)
    gsap.to(defaults, {
      yPercent: -100,
      duration: 0.72,
      stagger: 0.024,
      ease: 'back.out(1.2)',
    });
    
    // 호버 글자는 아래에서 위로 튀어오름 (탄력)
    gsap.to(hovers, {
      yPercent: -100,
      duration: 0.72,
      stagger: 0.024,
      ease: 'back.out(1.2)',
    });
  };

  // 개별 글자 단위 슬롯머신 호버 애니메이션 (이탈)
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (btn.getAttribute('data-active') === 'true') return; // 활성 페이지 메뉴는 호버 이탈 비활성화
    
    const defaults = btn.querySelectorAll('.char-default');
    const hovers = btn.querySelectorAll('.char-hover');
    
    gsap.killTweensOf([defaults, hovers]);
    
    // 기본 글자 제자리로 복귀 (탄력)
    gsap.to(defaults, {
      yPercent: 0,
      duration: 0.65,
      stagger: 0.018,
      ease: 'back.out(1.2)',
      onComplete: () => {
        gsap.set(defaults, { clearProps: 'transform' });
      }
    });
    
    // 호버 글자 원래 위치(아래쪽)로 하강 (탄력)
    gsap.to(hovers, {
      yPercent: 0,
      duration: 0.65,
      stagger: 0.018,
      ease: 'back.out(1.2)',
      onComplete: () => {
        gsap.set(hovers, { clearProps: 'transform' });
      }
    });
  };

  // 글자 개별 분할 렌더링 헬퍼 (슬롯머신 텍스트 롤용 마스크 구조 생성)
  const renderSplitText = (text: string, active: boolean, isKo: boolean = false, isNum: boolean = false) => {
    let defaultColorClass = '';
    let hoverColorClass = '';
    
    if (isNum) {
      defaultColorClass = active ? 'text-gold-deep' : 'text-gold/60';
      hoverColorClass = 'text-gold';
    } else if (isKo) {
      defaultColorClass = active ? 'text-gold-deep' : 'text-ink-soft';
      hoverColorClass = active ? 'text-gold' : 'text-gold-deep';
    } else {
      defaultColorClass = active ? 'text-gold-deep' : 'text-ink';
      hoverColorClass = 'text-gold';
    }

    const fontClass = isNum 
      ? 'font-en italic text-[clamp(16px,2vw,22px)]' 
      : isKo 
        ? 'font-ko text-[clamp(16px,1.8vw,21px)] ml-2.5 md:ml-4 tracking-normal normal-case font-medium' 
        : 'font-semibold';

    return (
      <span className={`inline-flex items-baseline ${fontClass}`}>
        {text.split('').map((char, i) => {
          if (char === ' ') {
            return <span key={i} className="inline-block">&nbsp;</span>;
          }
          return (
            <span key={i} className="relative overflow-hidden inline-flex flex-col h-[1.18em] leading-none select-none">
              {/* 기본 글자 */}
              <span className={`char-default inline-block h-full shrink-0 leading-none transition-colors duration-300 ${defaultColorClass}`}>
                {char}
              </span>
              {/* 호버 시 튀어오를 글자 */}
              <span className={`char-hover inline-block h-full shrink-0 leading-none transition-colors duration-300 ${hoverColorClass}`}>
                {char}
              </span>
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <>
      {/* 1. 중앙 상단 플로팅 글래스모피즘 헤더 바 (컴팩트 압축 & 크기 고정) */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={isIntroRunning ? { y: -64, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: pathname === '/' ? 0 : 0.15 }}
        className={`fixed z-[999] w-[90%] max-w-[190px] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 rounded-full flex items-center justify-between border border-line-soft/20 shadow-[0_8px_24px_rgba(42,38,32,0.04)] right-4 md:right-8 lg:right-12 top-2.5 h-12.5 px-3.5 ${
          isScrolled
            ? 'bg-cream/45 backdrop-blur-md shadow-[0_12px_32px_rgba(42,38,32,0.06)]'
            : 'bg-cream/25 backdrop-blur-sm'
        }`}
      >
        {/* A. 테두리 라인부분만 빛이 순환하며 도는 3D 골드 대칭 듀얼 빛무리 (Symmetrical Border Beam) */}
        <div className="border-glow-container">
          <div className="border-glow-beam-symmetrical" />
        </div>

        {/* 좌측: 로고와 브랜드 타이틀 */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="relative z-10 flex items-center gap-2.5 group select-none"
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
      </motion.header>

      {/* 2. GSAP 연동 풀스크린 내비게이션 오버레이 (무거운 backdrop-blur-2xl 제거하여 텍스트 렌더링 번짐/플리커 해결) */}
      {isOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[998] flex flex-col justify-center items-start pl-10 md:pl-28 lg:pl-36 overflow-hidden bg-cream/98"
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
                  <li key={p.key} className="flex justify-start overflow-hidden -my-1.5 py-1.5 relative">
                    {/* 활성 메뉴 뒷배경의 은은한 성스러운 아우라 (골드 광채 백라이트) */}
                    {active && (
                      <div
                        className="absolute inset-y-1 -left-4 w-[75%] max-w-[320px] pointer-events-none z-0 rounded-full opacity-80"
                        style={{
                          background: 'radial-gradient(ellipse at left, rgba(184, 154, 90, 0.15) 0%, rgba(253, 249, 240, 0) 75%)',
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleLinkClick(p.href)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      data-active={active}
                      className="menu-item group select-none bg-transparent border-0 p-0 text-left cursor-pointer whitespace-nowrap font-en text-[clamp(28px,4.8vw,54px)] uppercase tracking-[0.04em] relative z-10"
                    >
                      <div className="flex items-baseline gap-3.5 md:gap-5">
                        {renderSplitText(p.num, active, false, true)}
                        {renderSplitText(p.en, active, false, false)}
                        {renderSplitText(p.ko, active, true, false)}
                      </div>
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
