'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

type Props = {
  home: {
    year: number;
    themeKo: string;
    themeEn: string | null;
    heroBackgroundUrl: string;
    heroBackgroundPosition: string;
  };
};

export default function HomeClient({ home }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. 전체 스크롤 진척도 감지 (0 to 1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 2. 1섹션 (Hero) 스타일 변환값 정의
  // 스크롤이 내려감에 따라 (0 -> 0.4), 첫화면은 점점 흐려지고 페이드아웃 및 줌인
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 0.15, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.48], [1, 1.06]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.4], ["blur(0px)", "blur(8px)"]);

  // 3. 빛무리 포탈 (Glow-Burst) 스타일 변환값 정의
  // 스크롤 0 -> 0.48 지점까지 빛무리가 중앙에서 스케일 0 -> 24로 폭발적으로 확장, 65%까지 유지 후 걷힘
  const portalScale = useTransform(scrollYProgress, [0, 0.38, 0.48, 0.58], [0, 1.5, 20, 24]);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.1, 0.38, 0.48, 0.58, 0.72], [0, 0.6, 1, 1, 1, 0]);

  // 4. 2섹션 (The Sacred Space) 스타일 변환값 정의
  // 스크롤 0.45 -> 0.65 지점에서 서서히 선명하게 등장 (스케일 0.94 -> 1.0)
  const section2Opacity = useTransform(scrollYProgress, [0.45, 0.62, 0.98], [0, 1, 1]);
  const section2Scale = useTransform(scrollYProgress, [0.45, 0.65], [0.94, 1]);
  const section2Y = useTransform(scrollYProgress, [0.45, 0.65], [30, 0]);

  return (
    <div ref={containerRef} className="relative h-[220vh] bg-cream">
      
      {/* 뷰포트 고정 Sticky 프레임 */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        
        {/* ---------------- 1섹션: 웅장한 시네마틱 Hero ---------------- */}
        <motion.section 
          style={{ 
            opacity: heroOpacity, 
            scale: heroScale,
            filter: heroBlur
          }}
          className="absolute inset-0 w-full h-full flex flex-col justify-between p-10 md:p-16 pb-12 md:pb-14 z-10 overflow-hidden"
        >
          {/* 생생한 원본 사진 복원 */}
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-[3s] scale-100"
            style={{
              backgroundImage: `url('${home.heroBackgroundUrl}')`,
              backgroundPosition: home.heroBackgroundPosition,
            }}
          />
          
          {/* 텍스트 가독성을 방해하지 않는 극도로 은은한 반투명 소프트 필터 레이어 */}
          <div className="absolute inset-0 bg-black/15 z-0" />

          {/* 좌측 대형 타이포그래피 콘텐츠 (가독성 드롭 섀도우 극대화) */}
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[75%] md:max-w-[55%] max-[880px]:max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] transform transition-transform duration-500 md:-translate-y-16 -translate-y-8">
            <div className="mb-6 select-none">
              <span className="font-en text-[10px] tracking-[0.24em] uppercase text-[#ffd899] opacity-95 font-semibold">
                Praise Choir
              </span>
            </div>

            <h1 className="font-ko text-[clamp(34px,4.5vw,66px)] font-light leading-[1.14] text-[#f5edd8] tracking-tight mb-5 select-none">
              광진교회 <br className="hidden md:inline" />
              <span className="font-bold bg-gradient-to-r from-[#ffd899] via-gold to-[#ffd899] bg-clip-text text-transparent">
                프레이즈 찬양대
              </span>
              <span className="font-en font-extralight italic text-[clamp(26px,3.5vw,48px)] text-[#ffd899]/80 ml-3.5 align-baseline shrink-0">
                Praise
              </span>
            </h1>
          </div>

          {/* 2026 로고 워터마크 데코 */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 select-none z-10 pointer-events-none opacity-25 hidden md:block drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <img
              src="/church.svg"
              alt="광진교회"
              className="w-24 mix-blend-screen"
            />
          </div>
        </motion.section>


        {/* ---------------- 2. 빛무리 포탈 (Glow-Burst Overlay) ---------------- */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {/* 외곽 골드 광원 레이어 */}
          <motion.div 
            style={{ 
              scale: portalScale, 
              opacity: portalOpacity,
              x: '-50%',
              y: '-50%',
              transformOrigin: 'center center'
            }}
            className="glow-portal-overlay" 
          />
          {/* 내곽 소프트 화이트 광원 레이어 */}
          <motion.div 
            style={{ 
              scale: portalScale, 
              opacity: portalOpacity,
              x: '-50%',
              y: '-50%',
              transformOrigin: 'center center'
            }}
            className="glow-portal-overlay-secondary" 
          />
        </div>


        {/* ---------------- 3섹션: 성스러운 공간 (The Sacred Space - 2섹션) ---------------- */}
        <motion.section 
          style={{ 
            opacity: section2Opacity,
            scale: section2Scale,
            y: section2Y
          }}
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-cream z-10 px-8 select-none overflow-hidden"
        >
          {/* 장식용 은은한 성가대 배경 워터마크 라틴어 마키 */}
          <div 
            className="absolute top-[220px] left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0 opacity-45"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
              maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)'
            }}
          >
            <div className="animate-marquee flex whitespace-nowrap">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
                  SANCTUS · GLORIA · KYRIE · ALLELUIA
                </span>
              ))}
            </div>
          </div>

          {/* 중앙 콘텐츠: 올해의 표어 & 소개 브릿지 */}
          <div className="relative z-10 text-center flex flex-col items-center max-w-3xl">
            <span className="font-en text-[10.5px] tracking-[0.35em] uppercase text-gold mb-6 block font-semibold">
              — A.D. {home.year} Annual Theme
            </span>
            
            <h2 className="font-ko text-[clamp(24px,3.2vw,40px)] font-bold text-ink leading-[1.48] tracking-wide mb-6">
              “오직 하나님을 기뻐함으로 <br /> 승리하는 프레이즈”
            </h2>
            
            {home.themeEn && (
              <p className="font-en italic text-gold-deep text-[15.5px] opacity-90 tracking-wide font-medium">
                &ldquo;{home.themeEn}&rdquo;
              </p>
            )}

            {/* 위에서 아래로 그려지는 골드 드롭 실선 */}
            <div className="mt-14 w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
          </div>
        </motion.section>

      </div>

    </div>
  );
}
