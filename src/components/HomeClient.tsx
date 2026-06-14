'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

type Props = {
  home: {
    year: number;
    themeKo: string;
    themeEn: string | null;
    heroBackgroundUrl: string;
    heroBackgroundPosition: string;
  };
  preloadPhotos?: string[];
};


export default function HomeClient({ home, preloadPhotos = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // A. 인트로 애니메이션 제어용 상태 (Shed.design 영감 시네마틱 개방)
  const [isIntroActive, setIsIntroActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return !(window as unknown as { __hasSeenIntro?: boolean }).__hasSeenIntro;
    }
    return true;
  });
  const [montageIndex, setMontageIndex] = useState(0); // 0 ~ 7 (7단계가 최종 팽창)
  const [isFinalStepReady, setIsFinalStepReady] = useState(false);
  const [isFinalStepActive, setIsFinalStepActive] = useState(false);
  const [isAutoAdvancingFinalStep, setIsAutoAdvancingFinalStep] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);

  // B. 점진적 가속 몽타주 플래시 타이머 (컬러 4단계 + 사진 2단계 + 최종 팽창)
  useEffect(() => {
    if (!isIntroActive) return;

    // 각 단계를 시작하기 전에 기다릴 대기 시간(delay) 정의
    // 이전 단계가 시작되고 이 대기시간이 지나면 다음 단계가 작동합니다.
    const steps = [
      { index: 1, delay: 0 },         // 1단계: 다크잉크 (#2a2620)
      { index: 2, delay: 500 },       // 2단계: 차콜 브라운 (#4a3e2e)
      { index: 3, delay: 450 },       // 3단계: 딥골드 (#8a6f2f)
      { index: 4, delay: 400 },       // 4단계: 실버골드 (#d4c4a0)
      { index: 5, delay: 350 },       // 5단계: 중간 대원 사진 (/intro_5.webp) 낙하 시작
      { index: 6, delay: 300 },       // 6단계: 최종 히어로 사진 낙하 시작
      { index: 7, delay: 1100 + 500 } // 7단계: 팽창 시작! (1.1초 동안 완전히 내려와 안착하고, 500ms 동안 감상 후 팽창)
    ];

    const timers: NodeJS.Timeout[] = [];

    const runStep = (stepIdx: number) => {
      if (stepIdx >= steps.length) return;

      const step = steps[stepIdx];
      const id = setTimeout(() => {
        setMontageIndex(step.index);
        runStep(stepIdx + 1);
      }, step.delay);
      timers.push(id);
    };

    runStep(0);

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isIntroActive]);

  // C. 인트로 중 바디 스크롤 차단 및 해제 로직
  useEffect(() => {
    if (!isIntroActive) return;

    const html = document.documentElement;
    const { body } = document;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const preventScroll = (event: Event) => event.preventDefault();

    window.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.scrollTo(0, 0);
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
    };
  }, [isIntroActive]);

  // D. 대원 및 임원진 사진 백그라운드 사전 로딩 (Next.js 이미지 최적화 최적 매칭)
  useEffect(() => {
    if (isIntroActive || !preloadPhotos.length) return;

    let intervalId: NodeJS.Timeout;

    const startPreloading = () => {
      const nextWidths = [256, 384]; // 기기 화면 비율 2x, 3x에 각각 대응
      const tasks: string[] = [];

      preloadPhotos.forEach((src) => {
        nextWidths.forEach((width) => {
          tasks.push(`/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`);
        });
      });

      // 80ms 간격으로 순차적 요청하여 네트워크 스파이크 방지 및 서버 연산 로드 분산
      let index = 0;
      intervalId = setInterval(() => {
        if (index >= tasks.length) {
          clearInterval(intervalId);
          return;
        }
        const img = new window.Image();
        img.src = tasks[index];
        index++;
      }, 80);
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          startPreloading();
        });
      } else {
        // 브라우저 렌더링에 부담을 주지 않기 위해 2초 유휴 후 사전 페칭 시작
        const timer = setTimeout(startPreloading, 2000);
        return () => {
          clearTimeout(timer);
          if (intervalId) clearInterval(intervalId);
        };
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isIntroActive, preloadPhotos]);

  // 1. 브라우저 전체 스크롤 진척도 감지 (0 to 1)
  const { scrollYProgress } = useScroll();

  // 2. 1섹션 (Hero) 스타일 변환값 정의
  const heroOpacity = useTransform(scrollYProgress, [0, 0.42, 0.48, 1], [1, 0.15, 0, 0], { clamp: true });
  const heroScale = useTransform(scrollYProgress, [0, 0.48, 1], [1, 1.04, 1.04], { clamp: true });
  const heroBlur = useTransform(scrollYProgress, [0, 0.4, 1], ["blur(0px)", "blur(5px)", "blur(5px)"], { clamp: true });

  // 3. 포탈 정점 교차 지점용 따뜻한 금빛 단색 장막 오버레이 (0.48 ~ 0.58 지점에서 화면을 완전히 덮어 완벽한 심리스 전환 보증)
  const transitionOverlayOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.48, 0.58, 0.68, 1],
    [0, 1, 1, 0, 0],
    { clamp: true }
  );

  // 4. 2섹션 (The Sacred Space) 스타일 변환값 정의
  const section2Opacity = useTransform(scrollYProgress, [0.48, 0.62, 1], [0, 1, 1], { clamp: true });
  const section2Scale = useTransform(scrollYProgress, [0.48, 0.65, 1], [0.96, 1, 1], { clamp: true });
  const section2Y = useTransform(scrollYProgress, [0.48, 0.65, 1], [24, 0, 0], { clamp: true });

  // 5. 입체적인 종형 조명 정밀 정렬을 위한 3D 가상 공간 깊이 틸트
  const rotateX = useTransform(scrollYProgress, [0, 0.48, 1], [0, 8, 8], { clamp: true });
  const translateZ = useTransform(scrollYProgress, [0, 0.48, 1], [0, 60, 60], { clamp: true });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setIsFinalStepReady(latest > 0.92);

      if (isAutoAdvancingFinalStep && latest > 0.985) {
        setIsFinalStepActive(true);
        setIsAutoAdvancingFinalStep(false);
      }

      if (latest < 0.84) {
        setIsFinalStepActive(false);
        setIsAutoAdvancingFinalStep(false);
      }
    });

    return unsubscribe;
  }, [isAutoAdvancingFinalStep, scrollYProgress]);

  useEffect(() => {
    if (isIntroActive) return;

    const startFinalSequence = (event: Event) => {
      if (scrollYProgress.get() > 0.08 || isFinalStepActive || isAutoAdvancingFinalStep) return;

      event.preventDefault();
      setIsFinalStepActive(false);
      setIsAutoAdvancingFinalStep(true);

      if (autoScrollFrameRef.current !== null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
      }

      const startY = window.scrollY;
      const targetY = document.documentElement.scrollHeight - window.innerHeight;
      const distance = targetY - startY;
      const duration = 3200;
      const startedAt = performance.now();
      const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

      const animateScroll = (now: number) => {
        const elapsed = now - startedAt;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutSine(progress));

        if (progress < 1) {
          autoScrollFrameRef.current = requestAnimationFrame(animateScroll);
          return;
        }

        autoScrollFrameRef.current = null;
        setIsFinalStepActive(true);
        setIsAutoAdvancingFinalStep(false);
      };

      autoScrollFrameRef.current = requestAnimationFrame(animateScroll);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 20) {
        startFinalSequence(event);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      if (startY === null) return;

      const currentY = event.touches[0]?.clientY ?? startY;
      if (startY - currentY > 30) {
        startFinalSequence(event);
        touchStartYRef.current = null;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (autoScrollFrameRef.current !== null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
      }
    };
  }, [isAutoAdvancingFinalStep, isFinalStepActive, isIntroActive, scrollYProgress]);

  useEffect(() => {
    if (isIntroActive) return;

    const handleWheel = (event: WheelEvent) => {
      if (!isFinalStepReady || Math.abs(event.deltaY) < 20) return;

      if (event.deltaY > 0 && !isFinalStepActive) {
        event.preventDefault();
        setIsFinalStepActive(true);
      }

      if (event.deltaY < 0 && isFinalStepActive) {
        event.preventDefault();
        setIsFinalStepActive(false);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isFinalStepActive, isFinalStepReady, isIntroActive]);

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
        // [3D 체적화 핵심 A] 초고화질 가우시안 블러 필터 적용
        // 벡터 드로잉의 날카로운 선(2D 그림 느낌)을 완벽히 제거하고, 빛이 대기 중에 안개처럼 부서지는 3D 체적광 구현
        // -------------------------------------------------------------
        ctx.filter = 'blur(20px)';

        // -------------------------------------------------------------
        // [3D 체적화 핵심 B] 스크린 블렌딩 모드로 오리지널 이미지와 결합
        // 단순 레이어 덮어쓰기가 아닌, 배경 찬양대 사진과 자연스럽게 가색 혼합되어 실제 태양광 질감 복원
        // -------------------------------------------------------------
        ctx.globalCompositeOperation = 'screen';

        // -------------------------------------------------------------
        // [1] 수직으로 길게 하늘로 뻗은 다중 입체 태양기둥 (Volumetric Light Shafts)
        // -------------------------------------------------------------
        // 여러 겹의 세부 광선줄기가 수평으로 흔들리며 스며나오는 리얼한 햇빛 아지랑이 연출
        const beamCount = 5;
        for (let i = 0; i < beamCount; i++) {
          // 각 광선마다 독자적인 속도의 흔들림(shimmer) 값 적용
          const offset = (i - (beamCount - 1) / 2) * 45;
          const rayWidth = (28 + Math.sin(Date.now() * 0.0018 + i) * 10) * (1.0 + progress * 6.0);
          const rayAlpha = (0.05 + Math.cos(Date.now() * 0.0012 + i) * 0.02) * activeAlpha;

          const beamGrd = ctx.createLinearGradient(centerX + offset - rayWidth, 0, centerX + offset + rayWidth, 0);
          beamGrd.addColorStop(0, 'rgba(184, 154, 90, 0)');
          beamGrd.addColorStop(0.5, `rgba(255, 245, 220, ${rayAlpha})`);
          beamGrd.addColorStop(1, 'rgba(184, 154, 90, 0)');

          ctx.fillStyle = beamGrd;
          ctx.fillRect(centerX + offset - rayWidth, 0, rayWidth * 2, height);
        }

        // -------------------------------------------------------------
        // [2] 3D 방추형 마름모꼴 태양기둥 오버레이 (No-Clipping Spindle Flare)
        // 패스를 따서 채우는 강제 벡터 클리핑(2D 스티커 느낌의 주범)을 100% 걷어내고, 
        // 캔버스의 좌표계 가로세로 스케일 배율을 왜곡하여 완벽하게 부드러운 3D 그라데이션 방추형을 성형합니다.
        // -------------------------------------------------------------
        ctx.save();
        ctx.translate(centerX, centerY);

        // 미세한 대기 진동(Twinkle shiver) 효과 부여
        const shiver = Math.sin(Date.now() * 0.003) * 3;
        ctx.translate(0, shiver);

        // 가로 스케일은 1.1배, 세로 스케일은 5.2배로 좌표계를 늘려 자연스러운 수직 다이아몬드형 성형
        // (경계선이 없는 완벽한 부드러운 그라데이션)
        ctx.scale(1.1, 5.2);

        const spindleRadius = 45 * scale;
        const spindleGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, spindleRadius);
        spindleGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        spindleGrd.addColorStop(0.2, `rgba(255, 244, 210, ${activeAlpha * 0.95})`);
        spindleGrd.addColorStop(0.5, `rgba(218, 185, 115, ${activeAlpha * 0.38})`);
        spindleGrd.addColorStop(1, 'rgba(218, 185, 115, 0)'); // 경계선이 0으로 완벽히 수렴

        ctx.fillStyle = spindleGrd;
        ctx.beginPath();
        ctx.arc(0, 0, spindleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // -------------------------------------------------------------
        // [3] 태양 기둥 중심의 안개형 근원 코어 글로우 (Soft Atmospheric Core Glow)
        // -------------------------------------------------------------
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const coreRadius = 90 * scale;
        const coreGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
        coreGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        coreGrd.addColorStop(0.18, `rgba(255, 253, 245, ${activeAlpha * 0.92})`);
        coreGrd.addColorStop(0.42, `rgba(255, 235, 170, ${activeAlpha * 0.65})`);
        coreGrd.addColorStop(0.72, `rgba(184, 154, 90, ${activeAlpha * 0.22})`);
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
      
      {/* ============================================================= */}
      {/* D&G / Shed.design 영감 - 시네마틱 몽타주 플래시 -> 개방 인트로 */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isIntroActive && (
          <motion.div
            className="fixed inset-0 bg-cream z-[99999] flex items-center justify-center overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
          <motion.div
            initial={{
              width: "min(85vw, 424px)",
              height: "calc(min(85vw, 424px) * 273 / 424)",
              borderRadius: "0px",
            }}
            animate={
              montageIndex === 7
                ? {
                    width: "100vw",
                    height: "100vh",
                    borderRadius: "0px",
                  }
                : {
                    width: "min(85vw, 424px)",
                    height: "calc(min(85vw, 424px) * 273 / 424)",
                    borderRadius: "0px",
                  }
            }
            transition={{
              duration: 0.95, // 갤러리 팝업처럼 강력한 초기 팽창감을 위한 0.95초 스팬
              ease: [0.16, 1, 0.3, 1], // 갤러리식 감속을 재현하는 초고격조 expo.out 베지에 곡선
            }}
            onAnimationComplete={(definition) => {
              if (montageIndex === 7 && typeof definition === 'object' && definition !== null && 'width' in definition && definition.width === "100vw") {
                setIsIntroActive(false);
                if (typeof window !== 'undefined') {
                  (window as unknown as { __hasSeenIntro?: boolean }).__hasSeenIntro = true;
                }
                window.dispatchEvent(new CustomEvent('intro-complete'));
              }
            }}
            className="relative overflow-hidden flex items-center justify-center bg-transparent"
          >
            {/* 1단계: intro_1.webp (1.1초 동안 위에서 아래로 처음에 뜸들이다 빠르게 가속 낙하) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={montageIndex >= 1 ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
              className="absolute inset-0 bg-center bg-cover overflow-hidden"
              style={{
                backgroundColor: '#2a2620',
                backgroundImage: "url('/intro_1.webp')",
              }}
            />

            {/* 2단계: intro_2.webp (1.1초 동안 위에서 아래로 처음에 뜸들이다 빠르게 가속 낙하) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={montageIndex >= 2 ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
              className="absolute inset-0 bg-center bg-cover overflow-hidden"
              style={{
                backgroundColor: '#4a3e2e',
                backgroundImage: "url('/intro_2.webp')",
              }}
            />

            {/* 3단계: intro_3.webp (1.1초 동안 위에서 아래로 처음에 뜸들이다 빠르게 가속 낙하) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={montageIndex >= 3 ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
              className="absolute inset-0 bg-center bg-cover overflow-hidden"
              style={{
                backgroundColor: '#8a6f2f',
                backgroundImage: "url('/intro_3.webp')",
              }}
            />

            {/* 4단계: intro_4.webp (1.1초 동안 위에서 아래로 처음에 뜸들이다 빠르게 가속 낙하) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={montageIndex >= 4 ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
              className="absolute inset-0 bg-center bg-cover overflow-hidden"
              style={{
                backgroundColor: '#d4c4a0',
                backgroundImage: "url('/intro_4.webp')",
              }}
            />

            {/* 5단계: 중간 대원 사진 레이어 (intro_5.webp) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={montageIndex >= 5 ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
              className="absolute inset-0 bg-center bg-cover overflow-hidden"
              style={{
                backgroundColor: '#4a3e2e',
                backgroundImage: "url('/intro_5.webp')",
              }}
            />

            {/* 6단계: 최종 히어로 사진 레이어 */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={montageIndex >= 6 ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
              className="absolute inset-0 bg-center bg-cover overflow-hidden"
              style={{
                backgroundColor: '#4a3e2e',
                backgroundImage: `url('${home.heroBackgroundUrl}')`,
                backgroundPosition: home.heroBackgroundPosition,
              }}
            >
              <motion.div
                initial={{ scale: 1.15 }}
                animate={
                  montageIndex === 7
                    ? { scale: 1.0 }
                    : montageIndex >= 6
                    ? { scale: 1.0 }
                    : { scale: 1.15 }
                }
                transition={{
                  duration: montageIndex === 7 ? 0.95 : 1.1,
                  ease: montageIndex === 7 ? [0.16, 1, 0.3, 1] : "easeOut",
                  delay: montageIndex === 7 ? 0 : 0.05
                }}
                className="w-full h-full bg-inherit bg-center bg-cover"
                style={{
                  backgroundImage: `url('${home.heroBackgroundUrl}')`,
                  backgroundPosition: home.heroBackgroundPosition,
                }}
              />
            </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          
          {/* 좌측 대형 타이포그래피 콘텐츠 */}
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[75%] md:max-w-[55%] max-[880px]:max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] transform transition-transform duration-500 md:-translate-y-20 -translate-y-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={isIntroActive ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="mb-6 select-none"
            >
              <span className="font-en text-[10px] tracking-[0.24em] uppercase text-[#ffd899] opacity-95 font-semibold">
                Praise Choir
              </span>
            </motion.div>

            <h1 className="font-ko text-[clamp(30px,4.5vw,66px)] font-light leading-[1.14] text-[#f5edd8] tracking-tight mb-5 select-none">
              <motion.span 
                initial={{ opacity: 0, y: 36 }}
                animate={isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
                className="inline-block mr-2 md:mr-0"
              >
                광진교회
              </motion.span>
              <br />
              <motion.span 
                initial={{ opacity: 0, y: 36 }}
                animate={isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="inline-block font-bold bg-gradient-to-r from-[#ffd899] via-gold to-[#ffd899] bg-clip-text text-transparent mr-2 md:mr-3"
              >
                프레이즈
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 36 }}
                animate={isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.52 }}
                className="inline-block font-bold bg-gradient-to-r from-[#ffd899] via-gold to-[#ffd899] bg-clip-text text-transparent"
              >
                찬양대
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 36 }}
                animate={isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.64 }}
                className="inline-block font-en font-extralight italic text-[clamp(22px,3.5vw,48px)] text-[#ffd899]/80 ml-3.5 align-baseline shrink-0"
              >
                Praise
              </motion.span>
            </h1>
          </div>

          {/* 2026 로고 워터마크 데코 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isIntroActive ? { opacity: 0 } : { opacity: 0.25 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
            className="absolute right-12 top-1/2 -translate-y-1/2 select-none z-10 pointer-events-none hidden md:block drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          >
            <img
              src="/church.svg"
              alt="광진교회"
              className="w-24 mix-blend-screen"
            />
          </motion.div>
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
            
            <h2 className="font-ko text-[clamp(30px,4.2vw,56px)] font-bold text-ink leading-[1.36] tracking-wide mb-6">
              “오직 하나님을 기뻐함으로 <br /> 승리하는 프레이즈”
            </h2>
          </div>
        </motion.section>

        <div className="absolute -inset-x-px -inset-y-px z-30 flex pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }, (_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{ y: isFinalStepActive ? '0%' : '100%' }}
              style={{ marginLeft: index === 0 ? 0 : -1 }}
              transition={{
                duration: 0.72,
                delay: isFinalStepActive ? index * 0.055 : (9 - index) * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-[calc(100%+2px)] w-[calc(10%+2px)] shrink-0 bg-[#071426]"
            />
          ))}
        </div>

      </div>

    </div>
  );
}
