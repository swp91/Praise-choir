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

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  type: 'circle' | 'star';
  angle: number;
  rotationSpeed: number;
}

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

  // 5. 고성능 HTML5 Canvas 기반 황금빛 별빛 & 보케 흩날림 시네마틱 루프
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

    // 황금빛 별빛 입자 생성
    const sparkles: Sparkle[] = [];
    const maxSparkles = 95;

    for (let i = 0; i < maxSparkles; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.62, // 미세한 수평 표류
        vy: -Math.random() * 0.95 - 0.35,  // 은은하게 위로 상승 (햇빛 아지랑이 느낌)
        size: Math.random() * 2.8 + 1.2,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        phase: Math.random() * Math.PI * 2,
        type: Math.random() > 0.45 ? 'star' : 'circle', // 십자 별빛과 보케 보강
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015
      });
    }

    // 빛줄기(God Rays) 회전용 각도 변수
    let rayAngle = 0;

    // 렌더링 루프
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 현재 스크롤 진척도 확보
      const progress = scrollYProgress.get();

      // 빛무리 효과 전체 불투명도 계산 (스크롤 0% ~ 48%에 등장, 58% ~ 72%에 걷힘)
      let activeAlpha = 0;
      if (progress < 0.48) {
        activeAlpha = progress / 0.48; // 서서히 충전
      } else if (progress <= 0.58) {
        activeAlpha = 1.0;            // 최대 밝기 유지
      } else if (progress < 0.75) {
        activeAlpha = Math.max(0, 1.0 - (progress - 0.58) / 0.17); // 걷힘
      }

      if (activeAlpha > 0) {
        // [이펙트 A] 중앙 회전 황금빛 햇빛 (God Rays) 연출
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(rayAngle);
        rayAngle += 0.0024; // 미세 회전속도

        const rayCount = 8;
        const maxRadius = Math.max(width, height) * 0.85;

        for (let i = 0; i < rayCount; i++) {
          const angleStart = (i * Math.PI * 2) / rayCount;
          const angleWidth = 0.24; // 빛줄기 너비

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, maxRadius, angleStart, angleStart + angleWidth);
          ctx.closePath();

          // 부드러운 방사형 그라데이션 광선
          const rayGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
          rayGrd.addColorStop(0, `rgba(255, 238, 190, ${0.11 * activeAlpha})`);
          rayGrd.addColorStop(0.3, `rgba(255, 215, 120, ${0.055 * activeAlpha})`);
          rayGrd.addColorStop(1, 'rgba(255, 215, 120, 0)');

          ctx.fillStyle = rayGrd;
          ctx.fill();
        }
        ctx.restore();

        // [이펙트 B] 별빛 및 보케 입자 흩날림 연출
        sparkles.forEach((p) => {
          // 스크롤 진척도에 따라 중앙에서 바깥으로 퍼지는 3D 입체 카메라 속도 매핑
          const speedMultiplier = 1.0 + progress * 8.5; 
          
          p.y += p.vy * speedMultiplier;
          p.x += p.vx * speedMultiplier;
          p.phase += p.twinkleSpeed;
          p.angle += p.rotationSpeed;

          // 화면 밖으로 나간 입자 재배치 (끊임없는 순환 구조)
          if (p.y < -50) {
            p.y = height + 50;
            p.x = Math.random() * width;
          }
          if (p.x < -50 || p.x > width + 50) {
            p.x = Math.random() * width;
            p.y = height + 50;
          }

          // 반짝임 알파값 계산
          const currentAlpha = Math.max(0.1, Math.min(1.0, p.alpha * (Math.sin(p.phase) * 0.36 + 0.64))) * activeAlpha;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          if (p.type === 'star') {
            // 1. 레퍼런스 스타일: 정교한 십자형 플레어 별빛 (Twinkle Starburst)
            const flareSize = p.size * (1.0 + progress * 2.2);

            // 부드러운 중앙 글로우 볼
            const starGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, flareSize * 2.0);
            starGrd.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
            starGrd.addColorStop(0.35, `rgba(255, 218, 115, ${currentAlpha * 0.72})`);
            starGrd.addColorStop(1, 'rgba(255, 218, 115, 0)');
            ctx.fillStyle = starGrd;
            ctx.beginPath();
            ctx.arc(0, 0, flareSize * 2.0, 0, Math.PI * 2);
            ctx.fill();

            // 정교한 십자 별빛 꼬리 드로잉 (네 갈래 광선 플레어)
            ctx.fillStyle = `rgba(255, 245, 210, ${currentAlpha * 0.95})`;
            
            // 가로 광선
            ctx.beginPath();
            ctx.ellipse(0, 0, flareSize * 6.2, flareSize * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 세로 광선
            ctx.beginPath();
            ctx.ellipse(0, 0, flareSize * 0.32, flareSize * 6.2, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 2. 둥근 골드 아웃포커싱 보케 (Soft Gold Bokeh)
            const bokehRadius = p.size * (1.2 + progress * 3.5);
            
            const bokehGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, bokehRadius);
            bokehGrd.addColorStop(0, `rgba(255, 235, 160, ${currentAlpha * 0.85})`);
            bokehGrd.addColorStop(0.5, `rgba(212, 175, 55, ${currentAlpha * 0.32})`);
            bokehGrd.addColorStop(1, 'rgba(212, 175, 55, 0)');
            
            ctx.fillStyle = bokehGrd;
            ctx.beginPath();
            ctx.arc(0, 0, bokehRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });
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


        {/* ---------------- 2. 고화질 실시간 별빛 & 햇빛 흩날림 캔버스 ---------------- */}
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
