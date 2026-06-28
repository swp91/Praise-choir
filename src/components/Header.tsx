'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { usePageTransition } from '@/lib/transition';
import { motion } from 'framer-motion';

const isAppBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'app';

const PAGES = [
  { key: 'home',     href: '/',         en: 'Overview',     ko: '메인',   num: '01' },
  { key: 'members',  href: '/members',  en: 'Choristers',   ko: '대원',   num: '02' },
  { key: 'leaders',  href: '/leaders',  en: 'Leadership', ko: '임원',   num: '03' },
  { key: 'practice', href: '/practice', en: 'Schedule & Vision', ko: '연습 및 비전', num: '04' },
  { key: 'events',   href: '/events',   en: 'Calendar',     ko: '일정',   num: '05' },
  { key: 'gallery',  href: '/gallery',  en: 'Gallery',      ko: '갤러리', num: '06' },
  { key: 'archive',  href: '/archive',  en: 'Archive',      ko: '아카이브', num: '07' },
  ...(isAppBuild ? [] : [{ key: 'admin',    href: '/admin',    en: 'Console',      ko: '관리',   num: '08' }]),
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  const [isHeaderReady, setIsHeaderReady] = useState(false);
  
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

  useEffect(() => {
    let readyId: NodeJS.Timeout | null = null;
    let fallbackId: NodeJS.Timeout | null = null;
    let initId: NodeJS.Timeout | null = null;

    const showHeader = () => {
      setIsHeaderReady(true);
    };

    const scheduleHeader = () => {
      if (readyId) clearTimeout(readyId);
      readyId = setTimeout(showHeader, 150); // 150ms delay to align perfectly with the first word fade-in
    };

    initId = setTimeout(() => {
      if (pathname !== '/') {
        setIsHeaderReady(true);
        return;
      }

      setIsHeaderReady(false);

      if (typeof window !== 'undefined' && (window as unknown as { __hasSeenIntro?: boolean }).__hasSeenIntro) {
        showHeader();
      } else {
        window.addEventListener('intro-complete', scheduleHeader);
        fallbackId = setTimeout(scheduleHeader, 6000);
      }
    }, 0);

    return () => {
      if (initId) clearTimeout(initId);
      window.removeEventListener('intro-complete', scheduleHeader);
      if (readyId) clearTimeout(readyId);
      if (fallbackId) clearTimeout(fallbackId);
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
      {/* 1. 우측 상단 플로팅 글래스모피즘 햄버거 버튼 (원형) */}
      {isHeaderReady && (
        <motion.header
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center' }}
          className={`fixed z-[999] w-12.5 h-12.5 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 rounded-full flex items-center justify-center border border-line-soft/20 shadow-[0_8px_24px_rgba(42,38,32,0.04)] right-4 md:right-8 lg:right-12 top-2.5 ${
            isScrolled
              ? 'bg-cream/45 backdrop-blur-md shadow-[0_12px_32px_rgba(42,38,32,0.06)]'
              : 'bg-cream/25 backdrop-blur-sm'
          }`}
        >
        {/* A. 원형 테두리 라인 빛무리 */}
        <div className="border-glow-container rounded-full overflow-hidden">
          <div className="border-glow-beam-symmetrical" />
        </div>

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
                isOpen ? 'w-5 absolute top-1.5 -rotate-45' : 'w-5'
              }`}
            />
          </div>
        </button>
        </motion.header>
      )}

      {/* 2. GSAP 연동 풀스크린 내비게이션 오버레이 (무거운 backdrop-blur-2xl 제거하여 텍스트 렌더링 번짐/플리커 해결) */}
      {isOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[998] flex flex-col justify-start md:justify-center items-start pl-8 md:pl-28 lg:pl-36 overflow-y-auto py-24 md:py-8 bg-cream/98 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* 장식용 은은한 성가대 배경 워터마크 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max text-center pointer-events-none select-none opacity-[0.02] z-0 font-en font-bold italic tracking-[0.2em] text-[16vw] uppercase leading-none">
            SANCTUS
            <br />
            GLORIA
          </div>

          <nav className="relative z-10 w-full pr-12 my-auto md:my-0">
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
                      className="menu-item group select-none bg-transparent border-0 p-0 text-left cursor-pointer whitespace-nowrap font-en text-[clamp(22px,5.5vw,54px)] uppercase tracking-[0.04em] relative z-10"
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-5">
                        <div className="flex items-baseline gap-2.5 md:gap-3.5">
                          {renderSplitText(p.num, active, false, true)}
                          {renderSplitText(p.en, active, false, false)}
                        </div>
                        <div className="pl-[28px] md:pl-0 md:inline-block">
                          {renderSplitText(p.ko, active, true, false)}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>


        </div>
      )}
    </>
  );
}
