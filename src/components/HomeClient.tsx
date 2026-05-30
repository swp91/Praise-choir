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
  const heroScale = useTransform(scrollYProgress, [0, 0.48], [1, 1.04]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.4], ["blur(0px)", "blur(5px)"]);

  // 3. 포탈 정점 교차 지점용 따뜻한 금빛 단색 장막 오버레이 (0.48 ~ 0.58 지점에서 화면을 완전히 덮어 완벽한 심리스 전환 보증)
  const transitionOverlayOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.48, 0.58, 0.68],
    [0, 1, 1, 0]
  );

  // 4. 2섹션 (The Sacred Space) 스타일 변환값 정의
  const section2Opacity = useTransform(scrollYProgress, [0.48, 0.62, 0.98], [0, 1, 1]);
  const section2Scale = useTransform(scrollYProgress, [0.48, 0.65], [0.96, 1]);
  const section2Y = useTransform(scrollYProgress, [0.48, 0.65], [24, 0]);

  // 5. 입체적인 종형 조명 정밀 정렬을 위한 3D 가상 공간 깊이 틸트
  const rotateX = useTransform(scrollYProgress, [0, 0.48], [0, 8]);
  const translateZ = useTransform(scrollYProgress, [0, 0.48], [0, 60]);

  // 6. 고해상도 HTML5 Canvas 기반 단일 '성스러운 태양기둥 (Sun Pillar / Light Shaft)' 렌더링 루프
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

        // 스크롤 진척도에 따라 기둥의 굵기와 퍼짐 정도가 자연스럽게 팽창
        const scale = progress * 24; 
        
        ctx.save();

        // -------------------------------------------------------------
        // [1] 전역 블렌딩 모드를 'screen'으로 설정하여 실제 대기 중의 빛처럼 자연스럽게 섞이도록 연출
        // -------------------------------------------------------------
        ctx.globalCompositeOperation = 'screen';

        // -------------------------------------------------------------
        // [2] 수직으로 길게 하늘로 뻗은 태양기둥 몸체 (Vertical Light Column)
        // -------------------------------------------------------------
        // 화면 위쪽 끝부터 아래쪽 끝까지 뻗어나가는 soft하고 웅장한 수직 빔
        const beamWidth = 45 * (1.0 + progress * 8.5); // 스크롤 시 굵어짐
        
        const beamGrd = ctx.createLinearGradient(centerX - beamWidth, 0, centerX + beamWidth, 0);
        beamGrd.addColorStop(0, 'rgba(184, 154, 90, 0)');
        beamGrd.addColorStop(0.3, `rgba(255, 230, 175, ${activeAlpha * 0.18})`);
        beamGrd.addColorStop(0.5, `rgba(255, 255, 255, ${activeAlpha * 0.42})`);
        beamGrd.addColorStop(0.7, `rgba(255, 230, 175, ${activeAlpha * 0.18})`);
        beamGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

        ctx.fillStyle = beamGrd;
        ctx.fillRect(centerX - beamWidth, 0, beamWidth * 2, height);

        // -------------------------------------------------------------
        // [3] 레퍼런스 스타일: 중앙 수직 다이아몬드형 빛무리 (Vertical Diamond Spindle Flare)
        // -------------------------------------------------------------
        // 레퍼런스 사진처럼 중앙이 볼록하고 위아래로 길게 뻗어나가는 신비로운 마름모꼴/방추형 형태 드로잉
        const spindleHeight = 350 * scale; // 수직 확장성 극대화
        const spindleWidth = 75 * scale;   // 수평 굵기

        ctx.save();
        ctx.translate(centerX, centerY);

        // 3D 느낌을 위해 미세한 대기 진동(Twinkle shiver) 효과 부여
        const shiver = Math.sin(Date.now() * 0.0035) * 2.2;
        ctx.translate(0, shiver);

        // 방추형 다이아몬드 가이드 패스
        ctx.beginPath();
        ctx.moveTo(0, -spindleHeight / 2); // 맨 위 꼭짓점
        ctx.bezierCurveTo(spindleWidth * 0.6, -spindleHeight * 0.15, spindleWidth * 0.6, spindleHeight * 0.15, 0, spindleHeight / 2); // 우측 곡선 바늘
        ctx.bezierCurveTo(-spindleWidth * 0.6, spindleHeight * 0.15, -spindleWidth * 0.6, -spindleHeight * 0.15, 0, -spindleHeight / 2); // 좌측 곡선 바늘
        ctx.closePath();

        // 방추형 내부를 채우는 은은한 방사형 그라데이션 (대기 중 수증기에 부서지는 광채 시뮬레이션)
        const spindleGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, spindleHeight * 0.4);
        spindleGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        spindleGrd.addColorStop(0.18, `rgba(255, 240, 185, ${activeAlpha * 0.8})`);
        spindleGrd.addColorStop(0.45, `rgba(184, 154, 90, ${activeAlpha * 0.32})`);
        spindleGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

        ctx.fillStyle = spindleGrd;
        ctx.fill();
        ctx.restore();

        // -------------------------------------------------------------
        // [4] 태양 기둥 중심의 눈부신 코어 글로우 (Incandescent Sun Core)
        // -------------------------------------------------------------
        // 마우스 스크롤이 끝에 다다르면 화면 전체를 황금빛 성스러움으로 덮어버리는 마스터 광원볼
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const coreRadius = 75 * scale;
        const coreGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
        coreGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        coreGrd.addColorStop(0.12, `rgba(255, 254, 245, ${activeAlpha * 0.95})`);
        coreGrd.addColorStop(0.35, `rgba(255, 235, 170, ${activeAlpha * 0.72})`);
        coreGrd.addColorStop(0.65, `rgba(184, 154, 90, ${activeAlpha * 0.28})`);
        coreGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

        ctx.fillStyle = coreGrd;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

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

          {/* 좌측 대형 타이포그래피 콘텐츠 */}
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


        {/* ---------------- 2. 단일 거대 '태양기둥 (Sun Pillar)' 조명 드로잉 캔버스 ---------------- */}
        {/* 가상 3D 공간의 깊이를 주어 태양기둥 조명이 입체적으로 다가오도록 틸트 처리 */}
        <motion.div
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
            rotateX: rotateX,
            z: translateZ
          }}
          className="absolute inset-0 z-20 pointer-events-none w-full h-full flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </motion.div>


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
