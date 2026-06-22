"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { Conductor, Officer } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import {
  getHomeData,
  getLeadersData,
  getPracticeData,
  getGalleryData,
} from "@/lib/supabase/choir";

type Props = {
  preloadPhotos?: string[];
};

const PART_STEPS = [
  {
    key: "soprano1",
    tagline: "SOPRANO 1",
    title: "소프라노 1",
    poem: "가장 높은 곳에서 빛나는 천사의 목소리",
    desc: "맑고 투명한 천상의 고음으로 프레이즈 찬양의 선율을 이끕니다.",
    photo: "/intro_4.webp",
    bg: "#F5EED9",
    text: "#2A2620",
    accent: "#8a6f2f",
  },
  {
    key: "soprano2",
    tagline: "SOPRANO 2",
    title: "소프라노 2",
    poem: "가장 높은 곳에서 빛나는 천사의 목소리",
    desc: "맑고 투명한 천상의 고음으로 프레이즈 찬양의 선율을 이끕니다.",
    photo: "/intro_5.webp",
    bg: "#F5EED9",
    text: "#2A2620",
    accent: "#8a6f2f",
  },
  {
    key: "alto",
    tagline: "ALTO",
    title: "알토",
    poem: "찬양의 기둥이 되는 깊고 따뜻한 울림",
    desc: "묵묵하고 포근한 중저음으로 하모니의 풍성함을 더해줍니다.",
    photo: "/intro_2.webp",
    bg: "#B45A3F",
    text: "#FFFDF9",
    accent: "#ffd899",
  },
  {
    key: "tenor",
    tagline: "TENOR",
    title: "테너",
    poem: "하늘을 향해 높이 뻗어가는 화려한 선율",
    desc: "시원하고 당찬 미성으로 찬양에 밝은 에너지를 부여합니다.",
    photo: "/intro_1.webp",
    bg: "#FFFFFF",
    text: "#2A2620",
    accent: "#8a6f2f",
  },
  {
    key: "bass",
    tagline: "BASS",
    title: "베이스",
    poem: "모든 소리를 든든하게 받쳐주는 찬양의 기초",
    desc: "중후하고 깊은 저음으로 화성의 중심을 단단히 잡아줍니다.",
    photo: "/intro_3.webp",
    bg: "#4E7088",
    text: "#FFFDF9",
    accent: "#ffd899",
  },
  {
    key: "ensemble",
    tagline: "HAGIOS ENSEMBLE",
    title: "하기오스 악단",
    poem: "아름다운 악기 소리로 찬양을 완성하는 하기오스",
    desc: "현악과 관악의 조화로 성가를 더욱 입체적이고 아름답게 꾸밉니다.",
    photo: "/ensemble.webp",
    bg: "#D6C7DE",
    text: "#2A2620",
    accent: "#725291",
  },
];

type SlideCardProps = {
  item: {
    key: string;
    title: string;
    tagline: string;
    photo: string;
    isStaff: boolean;
  };
};

function SlideCard({ item }: SlideCardProps) {
  return (
    <div className="relative w-[220px] md:w-[320px] h-[150px] md:h-[210px] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-white/10 shrink-0 select-none group">
      {/* Background Photo */}
      <div className="w-full h-full relative overflow-hidden">
        {item.photo ? (
          <Image
            src={item.photo}
            alt={item.title}
            fill
            priority
            className="object-cover object-center transition-transform duration-[800ms] ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
            sizes="(max-width: 768px) 220px, 320px"
          />
        ) : (
          <div className="w-full h-full bg-[#1e2530] flex items-center justify-center text-[#ffd899]/30">
            <span className="text-xs">사진 없음</span>
          </div>
        )}
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Tagline Badge (Top Left) */}
      <span className="absolute top-4 left-4 font-en text-[9px] md:text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded bg-[#071426]/60 backdrop-blur-md text-[#ffd899] border border-white/5 font-semibold">
        {item.tagline}
      </span>

      {/* Name/Title (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex flex-col items-start gap-1">
        <span className="font-ko text-[14px] md:text-[18px] font-bold text-[#fbf7ee] tracking-wide">
          {item.title}
        </span>
      </div>
    </div>
  );
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  imageUrl: string;
  size: number;
  rotation: number;
  swayAmplitude: number;
  duration: number;
}

const DEFAULT_INTRO_PHOTOS = [
  "/intro_1.webp",
  "/intro_2.webp",
  "/intro_3.webp",
  "/intro_4.webp",
  "/intro_5.webp",
  "/ensemble.webp",
];

const FALLBACK_IMAGES = [
  "/intro_1.webp",
  "/intro_2.webp",
  "/intro_3.webp",
  "/intro_4.webp",
  "/intro_5.webp",
  "/ensemble.webp",
];

export default function HomeClient({ preloadPhotos = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: home } = useQuery({
    queryKey: ["home"],
    queryFn: getHomeData,
  });

  const { data: leaders } = useQuery({
    queryKey: ["leaders"],
    queryFn: getLeadersData,
  });

  const { data: practiceData } = useQuery({
    queryKey: ["practice"],
    queryFn: getPracticeData,
  });

  const { data: galleryPhotos = [] } = useQuery({
    queryKey: ["gallery"],
    queryFn: getGalleryData,
  });

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleWatermarkClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    // Pick random image from gallery or fallback images
    const availableImages = galleryPhotos.length > 0
      ? galleryPhotos.map((p) => p.url).filter((url): url is string => !!url)
      : FALLBACK_IMAGES;
    const imageUrl = availableImages.length > 0
      ? availableImages[Math.floor(Math.random() * availableImages.length)]
      : "/intro_1.webp";

    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      imageUrl,
      size: Math.floor(Math.random() * 80) + 200, // 200px to 280px (초대형 시작!)
      rotation: Math.floor(Math.random() * 40) - 20, // -20deg to 20deg
      swayAmplitude: Math.floor(Math.random() * 20) + 25, // 25px to 45px (크기에 맞춘 우아한 드리프트)
      duration: Math.random() * 3 + 9.5, // 9.5s to 12.5s (더 웅장하고 여유로운 상승시간)
    };

    setBubbles((prev) => [...prev, newBubble]);
  };

  const conductorsList = leaders?.conductors || [];
  const conductorSlides = conductorsList.map((c) => ({
    key: `conductor-${c.name}-${c.role}`,
    title: c.name,
    tagline: c.role,
    photo: c.photo || "",
    isStaff: true,
  }));

  const partSlides = PART_STEPS.map((step) => ({
    key: `part-${step.key}`,
    title: step.title,
    tagline: step.tagline,
    photo: home?.sectionPhotos?.[step.key] || step.photo,
    isStaff: false,
  }));

  const slideItems = [...conductorSlides, ...partSlides];

  // 인트로 이미지 배열 추출 (DB에 등록된 사진이 없으면 기본 5장 사용, 최대 5장 고정)
  // useMemo를 통해 렌더링 간 무한 참조 변경 및 useEffect 무한 재실행 버그 방지
  const introPhotos = useMemo(() => {
    return home?.introImages && home.introImages.length > 0
      ? home.introImages.slice(0, 6)
      : DEFAULT_INTRO_PHOTOS;
  }, [home?.introImages]);
  const numImages = introPhotos.length;

  // A. 인트로 애니메이션 제어용 상태 (Shed.design 영감 시네마틱 개방)
  const [isIntroActive, setIsIntroActive] = useState(() => {
    if (typeof window !== "undefined") {
      return !(window as unknown as { __hasSeenIntro?: boolean })
        .__hasSeenIntro;
    }
    return true;
  });
  const [montageIndex, setMontageIndex] = useState(0); // 0 ~ (numImages + 2) 단계
  const [introImagesLoaded, setIntroImagesLoaded] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(-1); // -1: Slogan, 0: Navy, 1~5: Parts
  const [isAutoAdvancingFinalStep, setIsAutoAdvancingFinalStep] =
    useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);

  // 최초 마운트 시 브라우저 자동 스크롤 복원 비활성화 (새로고침 시 스크롤 덜컹거림 버그 방지)
  useEffect(() => {
    if (typeof window !== "undefined" && window.history) {
      const originalScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = originalScrollRestoration;
      };
    }
  }, []);

  // 인트로 이미지 및 히어로 배경 사전 로드 대기 로직 (Next.js 이미지 최적화 매칭)
  useEffect(() => {
    if (!isIntroActive) {
      setIntroImagesLoaded(true);
      return;
    }

    const heroBgUrl = home?.heroBackgroundUrl || '/praise_photo.png';
    const rawUrls = [...introPhotos, heroBgUrl];
    const urls = rawUrls.map((url) => `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`);
    let loadedCount = 0;
    const totalToLoad = urls.length;
    let resolved = false;

    // 안전장치 타임아웃 (최대 1.5초 대기 후 강제 시작하여 무한 로딩 방지)
    const failSafeTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setIntroImagesLoaded(true);
      }
    }, 1500);

    const checkLoaded = () => {
      if (resolved) return;
      loadedCount++;
      if (loadedCount === totalToLoad) {
        resolved = true;
        clearTimeout(failSafeTimer);
        setIntroImagesLoaded(true);
      }
    };

    urls.forEach((url) => {
      const img = new window.Image();
      img.onload = checkLoaded;
      img.onerror = checkLoaded; // 이미지 로드 에러 시에도 카운트를 채워 동작 보장
      img.src = url;
    });

    return () => {
      clearTimeout(failSafeTimer);
    };
  }, [isIntroActive, introPhotos, home?.heroBackgroundUrl]);

  // B. 점진적 가속 몽타주 플래시 타이머 (등록된 사진 수에 맞게 동적 구성)
  useEffect(() => {
    if (!isIntroActive || !introImagesLoaded) return;

    // 각 단계를 시작하기 전에 기다릴 대기 시간(delay) 정의
    // 이전 단계가 시작되고 이 대기시간이 지나면 다음 단계가 작동합니다.
    const steps: { index: number; delay: number }[] = [];
    steps.push({ index: 1, delay: 0 }); // 1단계는 즉시 실행
    
    for (let i = 2; i <= numImages + 1; i++) {
      steps.push({ index: i, delay: 500 });
    }
    
    // 최종 팽창 시작 (1100ms 낙하 + 500ms 감상 대기)
    steps.push({ index: numImages + 2, delay: 1100 + 500 });

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
  }, [isIntroActive, numImages, introImagesLoaded]);

  // 텍스트가 화면에 보이는 팽창 시작 시점(montageIndex = numImages + 2)에 맞춰 헤더 메뉴바를 동시에 렌더링하도록 신호 발송
  useEffect(() => {
    if (montageIndex === numImages + 2 || !isIntroActive) {
      window.dispatchEvent(new CustomEvent("header-expand"));
    }
  }, [montageIndex, isIntroActive, numImages]);

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
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
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
          tasks.push(
            `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`,
          );
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

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
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

  // 1. 브라우저 전체 스크롤 진척도 감지 (0 to 1) 및 스프링 관성 스크롤 필터 정의 (GSAP scrub 대용)
  const { scrollY } = useScroll();

  const smoothScrollY = useSpring(scrollY, {
    damping: 40,
    stiffness: 120,
    mass: 0.5,
  });

  const sceneProgress = useTransform(smoothScrollY, (value) => {
    if (typeof window === "undefined") return 0;
    const vh = window.innerHeight;
    return Math.min(Math.max(value / vh, 0), 1);
  });

  const navyProgress = useTransform(smoothScrollY, (value) => {
    if (typeof window === "undefined") return 0;
    const vh = window.innerHeight;
    return Math.min(Math.max((value - vh) / (1.3 * vh), 0), 1);
  });

  // 2. 1섹션 (Hero) 스타일 변환값 정의
  const heroOpacity = useTransform(
    sceneProgress,
    [0, 0.42, 0.48, 1],
    [1, 0.15, 0, 0],
    { clamp: true },
  );
  const heroScale = useTransform(sceneProgress, [0, 0.48, 1], [1, 1.04, 1.04], {
    clamp: true,
  });
  const heroBlur = useTransform(
    sceneProgress,
    [0, 0.4, 1],
    ["blur(0px)", "blur(5px)", "blur(5px)"],
    { clamp: true },
  );

  // 3. 포탈 정점 교차 지점용 따뜻한 금빛 단색 장막 오버레이 (0.48 ~ 0.58 지점에서 화면을 완전히 덮어 완벽한 심리스 전환 보증)
  const transitionOverlayOpacity = useTransform(
    sceneProgress,
    [0.38, 0.48, 0.58, 0.68, 1],
    [0, 1, 1, 0, 0],
    { clamp: true },
  );

  // 4. 2섹션 (The Sacred Space) 스타일 변환값 정의
  const section2Opacity = useTransform(
    sceneProgress,
    [0.48, 0.62, 1],
    [0, 1, 1],
    { clamp: true },
  );
  const section2Scale = useTransform(
    sceneProgress,
    [0.48, 0.65, 1],
    [0.96, 1, 1],
    { clamp: true },
  );
  const section2Y = useTransform(sceneProgress, [0.48, 0.65, 1], [24, 0, 0], {
    clamp: true,
  });

  // 5. 입체적인 종형 조명 정밀 정렬을 위한 3D 가상 공간 깊이 틸트
  const rotateX = useTransform(sceneProgress, [0, 0.48, 1], [0, 8, 8], {
    clamp: true,
  });
  const translateZ = useTransform(sceneProgress, [0, 0.48, 1], [0, 60, 60], {
    clamp: true,
  });

  // 6. 네이비 색깔 화면 (섬김의 손길들) 스크럽 트랜지션 변환값
  const navyY = useTransform(navyProgress, [0.0, 1.0], ["100vh", "0vh"], {
    clamp: true,
  });
  const navyBorderRadius = useTransform(navyProgress, [0.0, 1.0], [48, 0], {
    clamp: true,
  });
  const navyContentOpacity = useTransform(navyProgress, [0.6, 1.0], [0, 1], {
    clamp: true,
  });

  // 6.5. 카드 슬라이더 등장용 진척도 (2.3vh ~ 3.6vh 스크롤)
  const cardsProgress = useTransform(smoothScrollY, (value) => {
    if (typeof window === "undefined") return 0;
    const vh = window.innerHeight;
    return Math.min(Math.max((value - 2.3 * vh) / (1.3 * vh), 0), 1);
  });

  const servantsWrapperY = useTransform(cardsProgress, (val) => {
    if (typeof window === "undefined") return "0vh";
    const isMobile = window.innerWidth < 768;
    const shift = isMobile ? -40 : -65;
    return `${val * shift}vh`;
  });

  // 7. 성가대 시간표 스크럽 트전지션 변환값 (3.6vh ~ 4.9vh 스크롤)
  const scheduleProgress = useTransform(smoothScrollY, (value) => {
    if (typeof window === "undefined") return 0;
    const vh = window.innerHeight;
    return Math.min(Math.max((value - 3.6 * vh) / (1.3 * vh), 0), 1);
  });
  const scheduleY = useTransform(
    scheduleProgress,
    [0.0, 1.0],
    ["100vh", "0vh"],
    { clamp: true },
  );
  const scheduleBorderRadius = useTransform(
    scheduleProgress,
    [0.0, 1.0],
    [48, 0],
    { clamp: true },
  );

  const wrapperBg = useTransform(smoothScrollY, (value) => {
    if (typeof window === "undefined") return "#fbf7ee";
    const vh = window.innerHeight;
    if (value < 2.3 * vh) {
      return "#fbf7ee";
    } else if (value < 3.6 * vh) {
      return "#071426";
    } else {
      return "#151210";
    }
  });

  useEffect(() => {
    const unsubscribe = navyProgress.on("change", (latest) => {
      if (latest < 0.2) {
        setActiveCardIndex(-1);
      } else {
        setActiveCardIndex(0); // Navy Screen
      }
    });

    return unsubscribe;
  }, [navyProgress]);

  useEffect(() => {
    if (isIntroActive) return;

    const scrollToTarget = (targetY: number, customDuration?: number) => {
      if (isAutoAdvancingFinalStep) return;
      setIsAutoAdvancingFinalStep(true);

      if (autoScrollFrameRef.current !== null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const vh = window.innerHeight;

      // Hero 스냅(0 <-> 1vh)은 원본의 장엄한 느낌(1.8초)을 유지하고, 나머지 섹션은 1.0초로 부드럽게 스냅
      const isHeroTransition = (targetY === 0 && startY <= vh * 1.05) || (targetY === vh && startY <= vh * 0.1);
      const duration = customDuration ?? (isHeroTransition ? 1800 : 1000);
      const startedAt = performance.now();
      const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

      const animateScroll = (now: number) => {
        const elapsed = now - startedAt;
        const progress = Math.min(elapsed / duration, 1);
        const currentY = startY + distance * easeInOutSine(progress);
        window.scrollTo(0, currentY);

        if (progress < 1) {
          autoScrollFrameRef.current = requestAnimationFrame(animateScroll);
          return;
        }

        autoScrollFrameRef.current = null;
        window.scrollTo(0, targetY);
        setIsAutoAdvancingFinalStep(false);
      };

      autoScrollFrameRef.current = requestAnimationFrame(animateScroll);
    };

    const handleWheel = (event: WheelEvent) => {
      if (isAutoAdvancingFinalStep) {
        event.preventDefault();
        return;
      }

      const vh = window.innerHeight;
      const currentScroll = window.scrollY;

      // 데스크톱 마우스 휠은 기존과 동일하게 영웅 섹션(0 <-> 1vh) snap만 지원하고, 이하 구간은 자연스러운 부드러운 스크롤 제공
      if (event.deltaY > 20) {
        if (currentScroll <= vh * 0.08) {
          event.preventDefault();
          scrollToTarget(vh, 1800);
        }
      } else if (event.deltaY < -20) {
        if (currentScroll >= vh * 0.1 && currentScroll <= vh * 1.05) {
          event.preventDefault();
          scrollToTarget(0, 1800);
        }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isAutoAdvancingFinalStep) {
        event.preventDefault();
        return;
      }

      const startY = touchStartYRef.current;
      if (startY === null) return;

      const currentY = event.touches[0]?.clientY ?? startY;
      const diff = startY - currentY; // 양수: 아래로 스크롤(화면 올림), 음수: 위로 스크롤(화면 내림)

      if (Math.abs(diff) > 30) {
        const vh = window.innerHeight;
        const currentScroll = window.scrollY;

        // 스티키 래퍼(4.9vh) 이후의 일반 영역(시간표 세부 정보 & 푸터)에서는 브라우저 기본 스크롤 허용
        if (currentScroll > 4.9 * vh + 10) {
          // 단, 일반 영역의 최상단에서 위로 스크롤하여 경계를 다시 넘어갈 때 이전 스티키 섹션(3.6vh)으로 스냅
          if (diff < -30 && currentScroll < 4.9 * vh + 120) {
            event.preventDefault();
            scrollToTarget(3.6 * vh);
            touchStartYRef.current = null;
          }
          return;
        }

        // 스티키 구간 내부에서는 터치 스와이프 발생 시 터치 기본 스크롤 동작을 차단하고 1개 섹션씩 스냅 이동
        event.preventDefault();
        const snapPoints = [0, 1.0 * vh, 2.3 * vh, 3.6 * vh, 4.9 * vh];

        if (diff > 30) {
          // 아래로 스크롤 (다음 섹션으로 스냅)
          const target = snapPoints.find((p) => p > currentScroll + 15);
          if (target !== undefined) {
            scrollToTarget(target);
          }
        } else if (diff < -30) {
          // 위로 스크롤 (이전 섹션으로 스냅)
          const reversedPoints = [...snapPoints].reverse();
          const target = reversedPoints.find((p) => p < currentScroll - 15);
          if (target !== undefined) {
            scrollToTarget(target);
          }
        }
        touchStartYRef.current = null;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isAutoAdvancingFinalStep, isIntroActive, scrollY]);

  useEffect(() => {
    return () => {
      if (autoScrollFrameRef.current !== null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
      }
    };
  }, []);

  // 5.5. 데스크탑 브라우저용 전역 스무스 마우스 휠 스크롤 감도 필터링 (예배시간표 이하 구간 스크롤 단절 해결)
  useEffect(() => {
    if (typeof window === "undefined" || isIntroActive) return;

    // 모바일 터치 기기는 OS 네이티브 관성 스크롤을 유지하기 위해 제외
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) return;

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let isMoving = false;
    let rafId: number | null = null;

    const syncScroll = () => {
      if (!isMoving) {
        targetScrollY = window.scrollY;
        currentScrollY = window.scrollY;
      }
    };

    const handleGlobalWheel = (e: WheelEvent) => {
      // 1섹션 Hero snap 구간 이하에서는 기존 개별 스크롤 이벤트에 제어권을 양도
      const vh = window.innerHeight;
      if (window.scrollY <= vh * 1.02 && e.deltaY < 0) {
        return; // 위로 스크롤하여 영웅 영역 진입 시 기존 스냅 적용
      }
      if (window.scrollY < vh * 0.95) {
        return; // 영웅 영역 내부
      }

      e.preventDefault();

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // 스크롤 감도가 너무 둔하거나 빠르지 않게 e.deltaY 적용
      targetScrollY += e.deltaY * 0.92;
      
      // 스냅 존 침범 제한
      targetScrollY = Math.max(vh * 0.95, Math.min(targetScrollY, maxScroll));

      if (!isMoving) {
        isMoving = true;
        const smooth = () => {
          const diff = targetScrollY - currentScrollY;
          // 프레이즈 고유 감도의 쫀득한 감속비
          currentScrollY += diff * 0.085;

          window.scrollTo(0, currentScrollY);

          if (Math.abs(diff) > 0.4) {
            rafId = requestAnimationFrame(smooth);
          } else {
            isMoving = false;
            window.scrollTo(0, targetScrollY);
          }
        };
        rafId = requestAnimationFrame(smooth);
      }
    };

    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("wheel", handleGlobalWheel, { passive: false });

    return () => {
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("wheel", handleGlobalWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isIntroActive]);

  // 6. 고해상도 HTML5 Canvas 기반 단일 '성스러운 태양기둥 (Sun Pillar / Light Shaft)' 렌더링 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
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
    window.addEventListener("resize", handleResize);

    // 렌더링 루프
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = sceneProgress.get();

      // 빛 효과 활성도 계산 (스크롤 0% ~ 48%에 등장, 58% ~ 75%에 걷힘)
      let activeAlpha = 0;
      if (progress < 0.48) {
        activeAlpha = progress / 0.48; // 서서히 충전
      } else if (progress <= 0.58) {
        activeAlpha = 1.0; // 최대 밝기 유지
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
        ctx.filter = "blur(20px)";

        // -------------------------------------------------------------
        // [3D 체적화 핵심 B] 스크린 블렌딩 모드로 오리지널 이미지와 결합
        // 단순 레이어 덮어쓰기가 아닌, 배경 찬양대 사진과 자연스럽게 가색 혼합되어 실제 태양광 질감 복원
        // -------------------------------------------------------------
        ctx.globalCompositeOperation = "screen";

        // -------------------------------------------------------------
        // [1] 수직으로 길게 하늘로 뻗은 다중 입체 태양기둥 (Volumetric Light Shafts)
        // -------------------------------------------------------------
        // 여러 겹의 세부 광선줄기가 수평으로 흔들리며 스며나오는 리얼한 햇빛 아지랑이 연출
        const beamCount = 5;
        for (let i = 0; i < beamCount; i++) {
          // 각 광선마다 독자적인 속도의 흔들림(shimmer) 값 적용
          const offset = (i - (beamCount - 1) / 2) * 45;
          const rayWidth =
            (28 + Math.sin(Date.now() * 0.0018 + i) * 10) *
            (1.0 + progress * 6.0);
          const rayAlpha =
            (0.05 + Math.cos(Date.now() * 0.0012 + i) * 0.02) * activeAlpha;

          const beamGrd = ctx.createLinearGradient(
            centerX + offset - rayWidth,
            0,
            centerX + offset + rayWidth,
            0,
          );
          beamGrd.addColorStop(0, "rgba(184, 154, 90, 0)");
          beamGrd.addColorStop(0.5, `rgba(255, 245, 220, ${rayAlpha})`);
          beamGrd.addColorStop(1, "rgba(184, 154, 90, 0)");

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
        const spindleGrd = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          spindleRadius,
        );
        spindleGrd.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha * 1.0})`);
        spindleGrd.addColorStop(
          0.2,
          `rgba(255, 244, 210, ${activeAlpha * 0.95})`,
        );
        spindleGrd.addColorStop(
          0.5,
          `rgba(218, 185, 115, ${activeAlpha * 0.38})`,
        );
        spindleGrd.addColorStop(1, "rgba(218, 185, 115, 0)"); // 경계선이 0으로 완벽히 수렴

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
        coreGrd.addColorStop(
          0.18,
          `rgba(255, 253, 245, ${activeAlpha * 0.92})`,
        );
        coreGrd.addColorStop(
          0.42,
          `rgba(255, 235, 170, ${activeAlpha * 0.65})`,
        );
        coreGrd.addColorStop(0.72, `rgba(184, 154, 90, ${activeAlpha * 0.22})`);
        coreGrd.addColorStop(1, "rgba(184, 154, 90, 0)");

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
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [sceneProgress]);

  if (!home || !leaders || !practiceData) return null;

  return (
    <div className="relative bg-cream">
      {/* ============================================================= */}
      {/* D&G / Shed.design 영감 - 시네마틱 몽타주 플래시 -> 개방 인트로 */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isIntroActive && (
          <motion.div
            className="fixed inset-0 bg-cream z-[99999] flex items-center justify-center overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              initial={{
                width: "min(85vw, 424px)",
                height: "calc(min(85vw, 424px) * 273 / 424)",
                borderRadius: "0px",
              }}
              animate={
                montageIndex === numImages + 2
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
                if (
                  montageIndex === numImages + 2 &&
                  typeof definition === "object" &&
                  definition !== null &&
                  "width" in definition &&
                  definition.width === "100vw"
                ) {
                  setIsIntroActive(false);
                  if (typeof window !== "undefined") {
                    (
                      window as unknown as { __hasSeenIntro?: boolean }
                    ).__hasSeenIntro = true;
                  }
                  window.dispatchEvent(new CustomEvent("intro-complete"));
                }
              }}
              className="relative overflow-hidden flex items-center justify-center bg-transparent"
            >
              {/* 등록된 인트로 사진 리스트를 동적으로 매핑하여 렌더링 */}
              {introPhotos.map((imgUrl, idx) => {
                const stepNum = idx + 1;
                // 각 슬라이드 배경에 어울리는 분위기 톤 색상 지정
                const bgColors = ["#2a2620", "#4a3e2e", "#8a6f2f", "#d4c4a0", "#4a3e2e"];
                const bgColor = bgColors[idx % bgColors.length];

                return (
                  <motion.div
                    key={`intro-photo-${idx}`}
                    initial={{ y: "-100%" }}
                    animate={montageIndex >= stepNum ? { y: 0 } : { y: "-100%" }}
                    transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
                    className="absolute inset-0 bg-center bg-cover overflow-hidden"
                    style={{
                      backgroundColor: bgColor,
                      backgroundImage: `url('/_next/image?url=${encodeURIComponent(imgUrl)}&w=1080&q=75')`,
                    }}
                  />
                );
              })}

              {/* 최종 히어로 사진 레이어 */}
              <motion.div
                initial={{ y: "-100%" }}
                animate={montageIndex >= numImages + 1 ? { y: 0 } : { y: "-100%" }}
                transition={{ duration: 1.1, ease: [0.6, 0, 0.8, 0.05] }}
                className="absolute inset-0 bg-center bg-cover overflow-hidden"
                style={{
                  backgroundColor: "#4a3e2e",
                  backgroundImage: `url('/_next/image?url=${encodeURIComponent(home?.heroBackgroundUrl || '/praise_photo.png')}&w=1080&q=75')`,
                  backgroundPosition: 'center 30%',
                }}
              >
                <motion.div
                  initial={{ scale: 1.15 }}
                  animate={
                    montageIndex === numImages + 2
                      ? { scale: 1.0 }
                      : montageIndex >= numImages + 1
                        ? { scale: 1.0 }
                        : { scale: 1.15 }
                  }
                  transition={{
                    duration: montageIndex === numImages + 2 ? 0.95 : 1.1,
                    ease: montageIndex === numImages + 2 ? [0.16, 1, 0.3, 1] : "easeOut",
                    delay: montageIndex === numImages + 2 ? 0 : 0.05,
                  }}
                  className="w-full h-full bg-inherit bg-center bg-cover"
                  style={{
                    backgroundImage: `url('/_next/image?url=${encodeURIComponent(home?.heroBackgroundUrl || '/praise_photo.png')}&w=1080&q=75')`,
                    backgroundPosition: 'center 30%',
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Section Wrapper (총 스크롤 600vh 범위 제공) */}
      <motion.div
        style={{ backgroundColor: wrapperBg }}
        className="relative h-[600vh] z-30"
      >
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          {/* ---------------- 1섹션: 웅장한 시네마틱 Hero ---------------- */}
          <motion.section
            style={{
              opacity: heroOpacity,
              scale: heroScale,
              filter: heroBlur,
            }}
            className="absolute inset-0 w-full h-full flex flex-col justify-between p-10 md:p-16 pb-12 md:pb-14 z-10 overflow-hidden"
          >
            {/* 생생한 원본 사진 복원 */}
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-[3s] scale-100"
              style={{
                backgroundImage: `url('${home?.heroBackgroundUrl || '/praise_photo.png'}')`,
                backgroundPosition: 'center 30%',
              }}
            />

            {/* 좌측 대형 타이포그래피 콘텐츠 */}
            <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[75%] md:max-w-[55%] max-[880px]:max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] transform transition-transform duration-500 md:-translate-y-20 -translate-y-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isIntroActive ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }
                }
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.15,
                }}
                className="mb-6 select-none"
              >
                <span className="font-en text-[10px] tracking-[0.24em] uppercase text-[#ffd899] opacity-95 font-semibold">
                  Praise Choir
                </span>
              </motion.div>

              <h1 className="font-ko text-[clamp(30px,4.5vw,66px)] font-light leading-[1.14] text-[#f5edd8] tracking-tight mb-5 select-none">
                <motion.span
                  initial={{ opacity: 0, y: 36 }}
                  animate={
                    isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }
                  }
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.28,
                  }}
                  className="inline-block mr-2 md:mr-0"
                >
                  광진교회
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 36 }}
                  animate={
                    isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }
                  }
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.4,
                  }}
                  className="inline-block font-bold bg-gradient-to-r from-[#ffd899] via-gold to-[#ffd899] bg-clip-text text-transparent mr-2 md:mr-3"
                >
                  프레이즈
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 36 }}
                  animate={
                    isIntroActive ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 }
                  }
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.52,
                  }}
                  className="inline-block font-bold bg-gradient-to-r from-[#ffd899] via-gold to-[#ffd899] bg-clip-text text-transparent"
                >
                  찬양대
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
              transformStyle: "preserve-3d",
              rotateX: rotateX,
              z: translateZ,
            }}
            className="absolute inset-0 z-20 pointer-events-none w-full h-full flex items-center justify-center"
          >
            <canvas ref={canvasRef} className="w-full h-full" />
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
              y: section2Y,
            }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-cream z-10 px-8 select-none overflow-hidden"
          >
            {/* 장식용 은은한 성가대 배경 워터마크 라틴어 마키 */}
            <div
              className="absolute top-[220px] left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0 opacity-45"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
                maskImage:
                  "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
              }}
            >
              <div className="animate-marquee flex whitespace-nowrap">
                {Array.from({ length: 8 }, (_, i) => (
                  <span
                    key={i}
                    className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0"
                  >
                    SANCTUS · GLORIA · KYRIE · ALLELUIA
                  </span>
                ))}
              </div>
            </div>

            {/* 중앙 콘텐츠: 올해의 표어 & 소개 브릿지 */}
            <div className="relative z-10 text-center flex flex-col items-center max-w-3xl">
              <span className="font-en text-[10.5px] tracking-[0.35em] uppercase text-gold mb-6 block font-semibold select-none">
                — A.D. {home?.year} Annual Theme
              </span>

              <h2 className="font-ko text-[clamp(30px,4.2vw,56px)] font-bold text-ink leading-[1.36] tracking-wide mb-6 whitespace-pre-line">
                {home?.themeKo ? `“${home.themeKo}”` : `“오직 하나님을 기뻐함으로\n승리하는 프레이즈”`}
              </h2>

              {home?.themeEn && (
                <p className="font-en text-[11px] md:text-[12px] tracking-[0.12em] text-gold mb-4 italic opacity-85 select-none">
                  {home.themeEn}
                </p>
              )}
            </div>
          </motion.section>

          {/* ---------------- 5. 네이비 색깔 화면 (섬김의 손길들) ---------------- */}
          {/* Servants Wrapper containing both Cover (Section 5) and Slider (Section 6) */}
          <motion.div
            style={{
              y: servantsWrapperY,
              zIndex: 30,
            }}
            className="absolute inset-0 w-full h-screen pointer-events-none"
          >
            {/* Section 5 (Cover) */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
              <motion.div
                style={{
                  y: navyY,
                  borderRadius: navyBorderRadius,
                }}
                className="relative bg-[#071426] text-[#fbf7ee] pointer-events-auto overflow-hidden w-full h-full"
              >
                {/* 상단 100vh 영역: 배경 이미지 + 텍스트 */}
                <div className="relative w-full h-screen flex flex-col justify-end pb-6 md:pb-10">
                  {/* 뒷배경 praise_02.webp 사진 적용 */}
                  <div
                    className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat transition-transform duration-[4s]"
                    style={{
                      backgroundImage: `url('${home?.servantsBackgroundUrl || '/praise_02.webp'}')`,
                      WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0) 95%)",
                      maskImage:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0) 95%)",
                    }}
                  />
                  {/* 어두운 그라데이션 오버레이 */}
                  <div className="absolute inset-0 z-5 bg-gradient-to-b from-[#071426]/0 via-[#071426]/30 to-[#071426] pointer-events-none" />

                  {/* 좌측 정렬 타이포그래피 텍스트 */}
                  <div className="relative z-10 flex flex-col items-start justify-end max-w-7xl w-full px-8 md:px-20 select-none pt-4 md:pt-10">
                    <span className="font-en text-[11px] md:text-[13px] tracking-[0.35em] uppercase text-gold font-semibold mb-3 md:mb-5 opacity-90">
                      Those Who Praise
                    </span>
                    <h3 className="font-ko text-[clamp(36px,5.2vw,72px)] font-bold tracking-tight leading-[1.22] text-cream text-left">
                      프레이즈를 <br />
                      섬기는 사람들
                    </h3>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Section 6 (Cards Slider) */}
            <div
              className="absolute left-0 w-full min-h-[40vh] md:min-h-[65vh] flex flex-col justify-center bg-[#071426] select-none overflow-hidden pt-6 md:pt-12 pb-10 md:pb-32 shadow-[0_-12px_48px_rgba(0,0,0,0.15)] mt-[-2px]"
              style={{
                top: "100vh",
                pointerEvents: "auto",
              }}
            >
              {/* 무한반복 가로 롤러 */}
              <div className="relative flex overflow-hidden w-full py-6 pointer-events-auto">
                {/* Track 1 */}
                <div
                  className="flex shrink-0 gap-6 animate-marquee-servants whitespace-nowrap min-w-full pr-6"
                  style={{ animationDuration: "18s" }}
                >
                  {slideItems.map((item) => (
                    <SlideCard key={item.key} item={item} />
                  ))}
                </div>
                {/* Track 2 (Duplicate for loop) */}
                <div
                  className="flex shrink-0 gap-6 animate-marquee-servants whitespace-nowrap min-w-full pr-6"
                  aria-hidden="true"
                  style={{ animationDuration: "18s" }}
                >
                  {slideItems.map((item) => (
                    <SlideCard key={`${item.key}-dup`} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- 7. 성가대 시간표 라이징 커버 영역 ---------------- */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
            style={{ zIndex: 40 }}
          >
            <motion.div
              style={{
                y: scheduleY,
                borderRadius: scheduleBorderRadius,
              }}
              className="relative bg-[#151210] text-[#fbf7ee] pointer-events-auto overflow-hidden w-full h-full"
            >
              {/* 상단 100vh 영역: 배경 이미지 + 텍스트 */}
              <div className="relative w-full h-screen flex flex-col justify-end pb-6 md:pb-10">
                {/* 뒷배경 praise_03.webp 사진 적용 */}
                <div
                  className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat transition-transform duration-[4s]"
                  style={{
                    backgroundImage: `url('${home?.practiceBackgroundUrl || '/praise_03.webp'}')`,
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0) 95%)",
                    maskImage:
                      "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0) 95%)",
                  }}
                />
                {/* 어두운 그라데이션 오버레이 */}
                <div className="absolute inset-0 z-5 bg-gradient-to-b from-[#151210]/0 via-[#151210]/30 to-[#151210] pointer-events-none" />

                {/* 좌측 정렬 타이포그래피 텍스트 */}
                <div className="relative z-10 flex flex-col items-start justify-end max-w-7xl w-full px-8 md:px-20 select-none pt-4 md:pt-10">
                  <span className="font-en text-[11px] md:text-[13px] tracking-[0.35em] uppercase text-gold font-semibold mb-3 md:mb-5 opacity-90">
                    Times of Praise
                  </span>
                  <h3 className="font-ko text-[clamp(36px,5.2vw,72px)] font-bold tracking-tight leading-[1.22] text-cream text-left">
                    프레이즈 <br />
                    연습 및 예배 시간표
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ---------------- 8 & 9. 시간표 세부 내용 및 푸터 리빌 컨테이너 ---------------- */}
      <div className="relative w-full bg-[#0c0a09] z-10">
        {/* ---------------- 8. 성가대 시간표 세부 레이아웃 - 커튼처럼 위로 올라가는 레이아웃 ---------------- */}
        <div className="relative w-full min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center bg-[#151210] z-30 select-none overflow-hidden pt-12 md:pt-16 pb-20 md:pb-28 shadow-[0_20px_50px_rgba(0,0,0,0.45)] mt-[-2px] mb-[100vh]">
          <div className="max-w-5xl w-full mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* 주일 오전 일정 */}
              <div className="flex flex-col gap-6">
                <h4 className="font-en text-[12px] md:text-[14px] tracking-[0.24em] uppercase text-gold font-semibold flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  Sunday Morning
                </h4>
                <div className="flex flex-col gap-4">
                  {practiceData.practice
                    .filter((_, idx) => idx <= 2)
                    .map((slot, index) => {
                      const isWorship = slot.tag === "예배";
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/30 transition-all duration-300"
                        >
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`self-start font-en text-[8px] md:text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded font-semibold w-max ${
                                isWorship
                                  ? "text-[#151210] bg-gold font-bold"
                                  : "text-cream/70 border border-white/10 font-semibold"
                              }`}
                            >
                              {slot.tag}
                            </span>
                            <span className="font-ko text-[16px] md:text-[18px] font-bold text-cream">
                              {slot.label}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-en font-bold text-[15px] md:text-[17px] text-gold block">
                              {slot.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 주일 오후/저녁 일정 */}
              <div className="flex flex-col gap-6">
                <h4 className="font-en text-[12px] md:text-[14px] tracking-[0.24em] uppercase text-gold font-semibold flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  Sunday Evening
                </h4>
                <div className="flex flex-col gap-4">
                  {practiceData.practice
                    .filter((_, idx) => idx > 2)
                    .map((slot, index) => {
                      const isWorship = slot.tag === "예배";
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/30 transition-all duration-300"
                        >
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`self-start font-en text-[8px] md:text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded font-semibold w-max ${
                                isWorship
                                  ? "text-[#151210] bg-gold font-bold"
                                  : "text-cream/70 border border-white/10 font-semibold"
                              }`}
                            >
                              {slot.tag}
                            </span>
                            <span className="font-ko text-[16px] md:text-[18px] font-bold text-cream">
                              {slot.label}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-en font-bold text-[15px] md:text-[17px] text-gold block">
                              {slot.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 9. 하단 브랜딩 및 가입안내 리빌 영역 (뒤에 숨어있다가 스크롤시 노출) ---------------- */}
        <div className="fixed bottom-0 left-0 w-full h-screen bg-[#0c0a09] z-20 flex flex-col justify-between p-8 pt-20 md:pt-28 pb-6 md:pb-8 text-[#fbf7ee]/90 overflow-hidden">
          {/* Background Decorative Grid or Aura */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/95 to-transparent pointer-events-none z-10" />

          {/* Get in Touch Section (Top of revealed footer) */}
          <div className="relative z-20 flex flex-col items-center text-center max-w-2xl mx-auto pt-4 md:pt-8 w-full">
            <span className="font-en text-[14px] md:text-[16px] tracking-[0.35em] uppercase text-gold font-semibold mb-3">
              Get in Touch
            </span>
            <h3 className="font-ko text-[clamp(24px,3.2vw,38px)] font-bold tracking-tight text-cream mb-4">
              프레이즈와 함께하기
            </h3>
            <p className="font-ko text-[13px] md:text-[15px] text-cream/70 leading-relaxed mb-6 md:mb-8 select-text break-keep">
              찬양대원 가입 신청이나 예배 참관 등 궁금한 점이 있으시다면{' '}
              <br className="hidden md:inline" />
              언제든 편하게 연락해 주시기 바랍니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full justify-center">
              {home?.contacts && home?.contacts.length > 0 ? (
                home?.contacts.map((contact: any, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center p-4 md:p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
                    <span className="font-ko text-[10px] md:text-xs text-gold font-semibold uppercase tracking-wider mb-1">
                      {contact.role}
                    </span>
                    <span className="font-ko text-[16px] md:text-[18px] font-bold text-cream mb-2">
                      {contact.name}
                    </span>
                    {contact.phone ? (
                      <>
                        <a
                          href={`tel:${contact.phone}`}
                          className="hidden sm:inline-block font-sans text-[14px] md:text-[15px] font-semibold tracking-wide text-cream/85 hover:text-gold transition-colors select-text"
                        >
                          {contact.phone}
                        </a>
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200 mt-1.5"
                          title="전화 걸기"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      </>
                    ) : (
                      <span className="font-ko text-[12px] text-cream/50 italic">연락처 없음</span>
                    )}
                  </div>
                ))
              ) : (
                <>
                  {/* 대장 카드 (Fallback) */}
                  <div className="flex-1 flex flex-col items-center p-4 md:p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
                    <span className="font-ko text-[10px] md:text-xs text-gold font-semibold uppercase tracking-wider mb-1">
                      대장
                    </span>
                    <span className="font-ko text-[16px] md:text-[18px] font-bold text-cream mb-2">
                      박대섭 장로
                    </span>
                    <a
                      href="tel:010-3720-0889"
                      className="hidden sm:inline-block font-sans text-[14px] md:text-[15px] font-semibold tracking-wide text-cream/85 hover:text-gold transition-colors select-text"
                    >
                      010-3720-0889
                    </a>
                    <a
                      href="tel:010-3720-0889"
                      className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200 mt-1.5"
                      title="전화 걸기"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* 총무 카드 (Fallback) */}
                  <div className="flex-1 flex flex-col items-center p-4 md:p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
                    <span className="font-ko text-[10px] md:text-xs text-gold font-semibold uppercase tracking-wider mb-1">
                      총무
                    </span>
                    <span className="font-ko text-[16px] md:text-[18px] font-bold text-cream mb-2">
                      김성만 집사
                    </span>
                    <a
                      href="tel:010-6225-4138"
                      className="hidden sm:inline-block font-sans text-[14px] md:text-[15px] font-semibold tracking-wide text-cream/85 hover:text-gold transition-colors select-text"
                    >
                      010-6225-4138
                    </a>
                    <a
                      href="tel:010-6225-4138"
                      className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200 mt-1.5"
                      title="전화 걸기"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Group: Huge Brand Typography & Address Marquee */}
          <div className="relative z-20 w-full mt-auto flex flex-col items-center justify-end select-none">
            {/* Huge Brand Typography */}
            <div 
              onMouseEnter={() => setHoverGlow((prev) => ({ ...prev, active: true }))}
              onMouseLeave={() => setHoverGlow((prev) => ({ ...prev, active: false }))}
              onMouseMove={handleMouseMove}
              className="relative w-[calc(100%+64px)] mx-[-32px] leading-none mb-1 md:mb-2 flex justify-center select-none cursor-pointer py-2 md:py-4"
            >
              {/* Radial glow follow mouse */}
              {hoverGlow.active && (
                <div
                  className="absolute pointer-events-none rounded-full blur-3xl opacity-80 mix-blend-screen transition-opacity duration-300"
                  style={{
                    left: hoverGlow.x - 175,
                    top: hoverGlow.y - 175,
                    width: 350,
                    height: 350,
                    background: "radial-gradient(circle, rgba(255,255,255,0.24) 0%, rgba(184,154,90,0.12) 45%, transparent 70%)",
                  }}
                />
              )}
              <span
                onClick={handleWatermarkClick}
                className="font-en font-bold tracking-[0.25em] text-[clamp(28px,9vw,180px)] leading-none text-transparent bg-clip-text bg-gradient-to-r from-white/10 via-white/45 to-white/10 bg-[length:200%_auto] animate-text-shine text-center uppercase whitespace-nowrap transition-transform hover:scale-[1.01] duration-300"
              >
                PRAISE CHOIR
              </span>
            </div>

            {/* Bottom Content: Infinitely Looping Address Marquee */}
            <div className="relative w-[calc(100%+64px)] mx-[-32px] mb-[-24px] md:mb-[-32px] overflow-hidden bg-[#141210] py-3.5 md:py-4 border-t border-white/5 flex">
              {/* Track 1 */}
              <div
                className="flex shrink-0 whitespace-nowrap animate-marquee-full min-w-full"
                style={{ animationDuration: "50s" }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="font-ko text-[12px] md:text-[13.5px] tracking-[0.06em] text-cream/85 pr-12 flex items-center shrink-0"
                  >
                    <span className="text-gold font-bold mr-2">
                      찾아오시는길:
                    </span>
                    <span>경기도 시흥시 정왕산길로 58 광진교회 시흥성전</span>
                    <span className="text-gold/45 ml-10 select-none">✦</span>
                  </span>
                ))}
              </div>
              {/* Track 2 (Duplicate for seamless loop) */}
              <div
                className="flex shrink-0 whitespace-nowrap animate-marquee-full min-w-full"
                aria-hidden="true"
                style={{ animationDuration: "50s" }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={`dup-${i}`}
                    className="font-ko text-[12px] md:text-[13.5px] tracking-[0.06em] text-cream/85 pr-12 flex items-center shrink-0"
                  >
                    <span className="text-gold font-bold mr-2">
                      찾아오시는길:
                    </span>
                    <span>경기도 시흥시 정왕산길로 58 광진교회 시흥성전</span>
                    <span className="text-gold/45 ml-10 select-none">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bubble Popout Animation overlay */}
          <AnimatePresence>
            {bubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                initial={{
                  scale: 0,
                  opacity: 0,
                  x: bubble.x - bubble.size / 2,
                  y: bubble.y - bubble.size / 2,
                  rotate: bubble.rotation,
                }}
                animate={{
                  scale: [0, 1.0, 2.5], // grows significantly bigger as it rises (초대형!)
                  opacity: [0, 1, 0.9, 0], // fades out near the top
                  y: -bubble.size - 100, // floats all the way up past the top of the viewport
                  x: [
                    bubble.x - bubble.size / 2,
                    bubble.x - bubble.size / 2 + bubble.swayAmplitude,
                    bubble.x - bubble.size / 2 - bubble.swayAmplitude,
                    bubble.x - bubble.size / 2 + bubble.swayAmplitude * 1.5,
                    bubble.x - bubble.size / 2 - bubble.swayAmplitude * 1.2,
                    bubble.x - bubble.size / 2 + bubble.swayAmplitude * 0.5,
                  ],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: bubble.duration,
                  ease: "easeOut",
                  x: {
                    duration: bubble.duration,
                    ease: "easeInOut",
                  },
                }}
                onAnimationComplete={() => {
                  setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
                }}
                className="absolute pointer-events-none z-50 rounded-full overflow-hidden border-2 border-white/50 shadow-[0_4px_15px_rgba(255,255,255,0.45),inset_0_0_12px_rgba(255,255,255,0.6)]"
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  transformOrigin: "center center",
                }}
              >
                <img
                  src={bubble.imageUrl}
                  alt="Bubble Gallery"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                {/* Glossy overlay to look like a soap bubble */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 rounded-full mix-blend-overlay" />
                <div className="absolute inset-0 border border-white/20 rounded-full" />
                {/* Specular highlight */}
                <div className="absolute top-1.5 left-1.5 w-3 h-1.5 bg-white/60 rounded-full rotate-[-45deg]" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
