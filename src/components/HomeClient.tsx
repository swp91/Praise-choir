'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 1. 브라우저 전체 스크롤 진척도 감지 (0 to 1)
  const { scrollYProgress } = useScroll();

  // 2. 1섹션 (Hero) 스타일 변환값 정의
  const heroOpacity = useTransform(scrollYProgress, [0, 0.42, 0.48], [1, 0.15, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.48], [1, 1.05]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.4], ["blur(0px)", "blur(6px)"]);

  // 3. 포탈 정점 교차 지점용 따뜻한 금빛 단색 장막 오버레이 (0.48 ~ 0.58 지점에서 화면을 완전히 덮어 완벽한 심리스 전환 보증)
  const transitionOverlayOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.48, 0.58, 0.68],
    [0, 1, 1, 0]
  );

  // 4. 2섹션 (The Sacred Space) 스타일 변환값 정의
  const section2Opacity = useTransform(scrollYProgress, [0.48, 0.62, 0.98], [0, 1, 1]);
  const section2Scale = useTransform(scrollYProgress, [0.48, 0.65], [0.95, 1]);
  const section2Y = useTransform(scrollYProgress, [0.48, 0.65], [24, 0]);

  // 5. 고해상도 HTML5 Canvas 기반 단일 '슈퍼노바 렌즈 플레어 (Lens Flare)' 렌더링 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 창 크기 조절 대응
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 렌더링 루프
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = scrollYProgress.get();

      // 빛 효과 활성도 계산 (스크롤 0% ~ 48%에 등장, 58% ~ 75%에 걷힘)
      let activeAlpha = 0;
      if (progress < 0.48) {
        activeAlpha = progress / 0.48; // 서서히 충전
      } else if (progress <= 0.58) {
        activeAlpha = 1.0;            // 최대 밝기 유지
      } else if (progress < 0.75) {
        activeAlpha = Math.max(0, 1.0 - (progress - 0.58) / 0.17); // 걷힘
      }

      if (activeAlpha > 0) {
        const centerX = width / 2;
        const centerY = height / 2;

        // 스크롤에 따라 포탈의 스케일과 회전 각도 매핑
        // 정점에서 백그라운드를 완전히 덮을 수 있도록 scale 폭을 크게 설계 (최대 30배)
        const scale = progress * 30; 
        const rotation = progress * Math.PI * 1.8; // 스크롤에 따라 빛줄기가 다이내믹하게 회전

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        // -------------------------------------------------------------
        // [1] 레퍼런스 스타일: 방사형 침상 광선 플레어 (Sharp Needle Spikes)
        // -------------------------------------------------------------
        // 총 16개의 날카롭고 얇은 금빛/흰빛 바늘 스파이크를 드로잉
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i * Math.PI * 2) / rayCount;
          
          // 긴 광선, 중간 광선, 짧은 광선을 불규칙하게 배치하여 격조 높은 입체감 연출
          const isExtraLong = i % 4 === 0;
          const isLong = i % 2 === 0;
          const rayLength = (isExtraLong ? 340 : (isLong ? 210 : 120)) * scale;
          const rayWidth = (isExtraLong ? 16 : (isLong ? 8 : 4)) * scale * 0.1;

          ctx.save();
          ctx.rotate(angle);

          // 십자 별빛 바늘 드로잉 (삼각형 폴리곤 결합)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rayWidth, 0);
          ctx.lineTo(0, rayLength);
          ctx.lineTo(-rayWidth, 0);
          ctx.closePath();

          // 꼬리 부분으로 갈수록 부드럽게 페이드아웃되는 선형 그라데이션 광선
          const rayGrd = ctx.createLinearGradient(0, 0, 0, rayLength);
          rayGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 0.95})`);
          rayGrd.addColorStop(0.12, `rgba(255, 228, 160, ${activeAlpha * 0.85})`);
          rayGrd.addColorStop(0.4, `rgba(184, 154, 90, ${activeAlpha * 0.35})`);
          rayGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

          ctx.fillStyle = rayGrd;
          ctx.fill();

          ctx.restore();
        }

        // -------------------------------------------------------------
        // [2] 소프트 렌즈 플레어 헤일로 링 (Secondary Halo Ring)
        // -------------------------------------------------------------
        const haloRadius = 100 * scale;
        const haloGrd = ctx.createRadialGradient(0, 0, haloRadius * 0.85, 0, 0, haloRadius);
        haloGrd.addColorStop(0, 'rgba(255, 235, 175, 0)');
        haloGrd.addColorStop(0.88, `rgba(255, 215, 120, ${activeAlpha * 0.08})`);
        haloGrd.addColorStop(0.95, `rgba(255, 238, 185, ${activeAlpha * 0.2})`);
        haloGrd.addColorStop(1, 'rgba(255, 238, 185, 0)');
        
        ctx.fillStyle = haloGrd;
        ctx.beginPath();
        ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // -------------------------------------------------------------
        // [3] 초강력 중심 코어 글로우 볼 (Supernova White Core)
        // -------------------------------------------------------------
        // 스크롤이 끝에 도달할 때 이 거대한 흰빛 광원이 화면의 100%를 삼켜 완벽하게 눈부신 페이드 역할 수행
        const glowRadius = 90 * scale;
        const glowGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        glowGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        glowGrd.addColorStop(0.15, `rgba(255, 254, 248, ${activeAlpha * 0.98})`);
        glowGrd.addColorStop(0.38, `rgba(255, 232, 160, ${activeAlpha * 0.8})`);
        glowGrd.addColorStop(0.7, `rgba(184, 154, 90, ${activeAlpha * 0.28})`);
        glowGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

        ctx.fillStyle = glowGrd;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollYProgress]);

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


        {/* ---------------- 2. 단일 거대 슈퍼노바 렌즈 플레어 드로잉 캔버스 ---------------- */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-20 pointer-events-none w-full h-full"
        />


        {/* ---------------- 3. 심리스 포탈용 황금빛 안개 장막 (Aura Intersection) ---------------- */}
        <motion.div
          style={{ opacity: transitionOverlayOpacity }}
          className="absolute inset-0 bg-[#fbf7ee] z-15 pointer-events-none"
        />


        {/* ---------------- 4섹션: 성스러운 공간 (The Sacred Space - 2섹션) ---------------- */}
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
