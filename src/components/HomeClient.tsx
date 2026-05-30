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

  // 5. 3D 입체 투영(Perspective Tilt)을 위한 모션 변환값
  // 스크롤이 내려감에 따라 광원 자체가 3D 가상 공간 상에서 기울어지며 차원 입체감을 부여
  const rotateX = useTransform(scrollYProgress, [0, 0.48], [0, 12]);   // X축 회전 기울기
  const rotateY = useTransform(scrollYProgress, [0, 0.48], [0, -8]);   // Y축 회전 기울기
  const translateZ = useTransform(scrollYProgress, [0, 0.48], [0, 80]); // Z축 앞으로 튀어나오는 입체 깊이

  // 6. 고해상도 HTML5 Canvas 기반 다중 레이어 입체 '3D 볼류메트릭 슈퍼노바' 렌더링 루프
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
        
        // 가시적 스케일 팽창 (최대 32배)
        const scale = progress * 32; 

        // -------------------------------------------------------------
        // [3D 효과 핵심 1] 다중 회전 축 패럴랙스 (Multi-axial Counter-Rotation)
        // 레이어 간의 회전 속도와 방향을 다르게 설정하여 평면(2D)이 아닌 입체(3D) 느낌을 즉시 확보합니다.
        // -------------------------------------------------------------
        const angleLayerA = progress * Math.PI * 2.0;   // 시계 방향 고속 회전
        const angleLayerB = -progress * Math.PI * 1.2;  // 반시계 방향 저속 회전
        const angleLayerC = progress * Math.PI * 0.6;   // 시계 방향 배경 미세 회전

        // ==========================================
        // LAYER C: 배경 볼류메트릭 아날로그 연무 (Soft Depth Aura)
        // ==========================================
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleLayerC);
        
        // 흐릿하게 퍼지는 입체 안개 성운 느낌의 3D 백그라운드 구형 드로잉
        const bgGlowRadius = 140 * scale;
        const bgGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, bgGlowRadius);
        bgGlow.addColorStop(0, `rgba(255, 230, 170, ${activeAlpha * 0.28})`);
        bgGlow.addColorStop(0.4, `rgba(184, 154, 90, ${activeAlpha * 0.12})`);
        bgGlow.addColorStop(1, 'rgba(184, 154, 90, 0)');
        ctx.fillStyle = bgGlow;
        ctx.beginPath();
        ctx.arc(0, 0, bgGlowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ==========================================
        // LAYER B: 후면 원거리 침상 광선 (Background Fine Spikes)
        // ==========================================
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleLayerB);
        
        const backgroundRayCount = 12;
        for (let i = 0; i < backgroundRayCount; i++) {
          const angle = (i * Math.PI * 2) / backgroundRayCount;
          // 후면용 미세 스파이크 길이 (미세하게 작고 부드러움)
          const rayLength = 150 * scale;
          const rayWidth = 6 * scale * 0.1;

          ctx.save();
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rayWidth, 0);
          ctx.lineTo(0, rayLength);
          ctx.lineTo(-rayWidth, 0);
          ctx.closePath();

          // 깊이감을 위한 약간 더 오렌지/앰버 톤의 깊은 색채 설계
          const rayGrd = ctx.createLinearGradient(0, 0, 0, rayLength);
          rayGrd.addColorStop(0, `rgba(255, 220, 140, ${activeAlpha * 0.72})`);
          rayGrd.addColorStop(0.3, `rgba(212, 175, 55, ${activeAlpha * 0.42})`);
          rayGrd.addColorStop(1, 'rgba(212, 175, 55, 0)');

          ctx.fillStyle = rayGrd;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // ==========================================
        // LAYER A: 전면 근거리 주 광선 (Foreground Sharp Spikes)
        // -----------------------------------------------------------
        // [3D 효과 핵심 2] 색수차 시뮬레이션 (Chromatic Dispersion)
        // 렌즈 굴절에 의해 생기는 붉은색/푸른색의 빛 분산을 모방하여 시네마틱한 사실감을 더합니다.
        // ==========================================
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleLayerA);

        const foregroundRayCount = 8;
        for (let i = 0; i < foregroundRayCount; i++) {
          const angle = (i * Math.PI * 2) / foregroundRayCount;
          const isExtraLong = i % 2 === 0;
          const rayLength = (isExtraLong ? 360 : 220) * scale;
          const rayWidth = (isExtraLong ? 18 : 10) * scale * 0.1;

          ctx.save();
          ctx.rotate(angle);

          // 1. 색수차용 우측 레드/오렌지 플레어 오프셋 레이어
          ctx.save();
          ctx.translate(1.5 * (1 + progress * 2), 0);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rayWidth, 0);
          ctx.lineTo(0, rayLength * 0.98);
          ctx.lineTo(-rayWidth, 0);
          ctx.closePath();
          const redGrd = ctx.createLinearGradient(0, 0, 0, rayLength);
          redGrd.addColorStop(0, `rgba(255, 120, 50, ${activeAlpha * 0.45})`);
          redGrd.addColorStop(0.6, 'rgba(255, 120, 50, 0)');
          ctx.fillStyle = redGrd;
          ctx.fill();
          ctx.restore();

          // 2. 색수차용 좌측 블루/시안 플레어 오프셋 레이어
          ctx.save();
          ctx.translate(-1.5 * (1 + progress * 2), 0);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rayWidth, 0);
          ctx.lineTo(0, rayLength * 0.98);
          ctx.lineTo(-rayWidth, 0);
          ctx.closePath();
          const blueGrd = ctx.createLinearGradient(0, 0, 0, rayLength);
          blueGrd.addColorStop(0, `rgba(0, 200, 255, ${activeAlpha * 0.38})`);
          blueGrd.addColorStop(0.6, 'rgba(0, 200, 255, 0)');
          ctx.fillStyle = blueGrd;
          ctx.fill();
          ctx.restore();

          // 3. 메인 브라이트 화이트-골드 침상 광선
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rayWidth, 0);
          ctx.lineTo(0, rayLength);
          ctx.lineTo(-rayWidth, 0);
          ctx.closePath();

          const mainRayGrd = ctx.createLinearGradient(0, 0, 0, rayLength);
          mainRayGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
          mainRayGrd.addColorStop(0.1, `rgba(255, 238, 180, ${activeAlpha * 0.92})`);
          mainRayGrd.addColorStop(0.45, `rgba(184, 154, 90, ${activeAlpha * 0.42})`);
          mainRayGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

          ctx.fillStyle = mainRayGrd;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // -------------------------------------------------------------
        // [3] 입체 렌즈 링 & 2중 헤일로 (Soft Double Halo Rings)
        // -------------------------------------------------------------
        ctx.save();
        ctx.translate(centerX, centerY);
        const halo1Radius = 100 * scale;
        const halo1Grd = ctx.createRadialGradient(0, 0, halo1Radius * 0.88, 0, 0, halo1Radius);
        halo1Grd.addColorStop(0, 'rgba(255, 235, 175, 0)');
        halo1Grd.addColorStop(0.9, `rgba(255, 220, 130, ${activeAlpha * 0.07})`);
        halo1Grd.addColorStop(0.96, `rgba(255, 235, 185, ${activeAlpha * 0.16})`);
        halo1Grd.addColorStop(1, 'rgba(255, 235, 175, 0)');
        ctx.fillStyle = halo1Grd;
        ctx.beginPath();
        ctx.arc(0, 0, halo1Radius, 0, Math.PI * 2);
        ctx.fill();

        const halo2Radius = 145 * scale;
        const halo2Grd = ctx.createRadialGradient(0, 0, halo2Radius * 0.93, 0, 0, halo2Radius);
        halo2Grd.addColorStop(0, 'rgba(255, 235, 175, 0)');
        halo2Grd.addColorStop(0.97, `rgba(255, 235, 185, ${activeAlpha * 0.05})`);
        halo2Grd.addColorStop(1, 'rgba(255, 235, 175, 0)');
        ctx.fillStyle = halo2Grd;
        ctx.beginPath();
        ctx.arc(0, 0, halo2Radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // -------------------------------------------------------------
        // [4] 초강력 입체 코어 글로우 볼 (Volumetric Core Glow)
        // -------------------------------------------------------------
        ctx.save();
        ctx.translate(centerX, centerY);
        const glowRadius = 90 * scale;
        const glowGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        glowGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        glowGrd.addColorStop(0.12, `rgba(255, 254, 250, ${activeAlpha * 0.98})`);
        glowGrd.addColorStop(0.35, `rgba(255, 232, 160, ${activeAlpha * 0.85})`);
        glowGrd.addColorStop(0.68, `rgba(184, 154, 90, ${activeAlpha * 0.32})`);
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


        {/* ---------------- 2. 단일 거대 슈퍼노바 렌즈 플레어 드로잉 캔버스 ---------------- */}
        {/* [3D 효과 핵심 3] CSS 3DPerspective Matrix 적용 */}
        {/* 스크롤 가속에 따라 캔버스 프레임 자체가 가상 3D 공간 상에서 3차원 기울어짐 모션을 작동하여 완벽한 체적 깊이를 창조합니다. */}
        <motion.div
          style={{
            perspective: 1200,
            transformStyle: 'preserve-3d',
            rotateX: rotateX,
            rotateY: rotateY,
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
