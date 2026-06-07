'use client';
import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PAGE_ORDER: Record<string, number> = {
  '/': 1, '/members': 2, '/leaders': 3,
  '/practice': 4, '/events': 5, '/gallery': 6,
};

export type Direction = 'forward' | 'backward';

interface TransitionCtx {
  direction: Direction;
  turning: boolean;
  tick: number;
  navigate: (href: string) => void;
  onPageMounted: () => void;
}

const Ctx = createContext<TransitionCtx>({
  direction: 'forward', turning: false, tick: 0, navigate: () => {}, onPageMounted: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const turningRef = useRef(false);
  const [direction, setDirection] = useState<Direction>('forward');
  const [turning, setTurning] = useState(false);
  const [tick, setTick] = useState(0);

  const transitionStartRef = useRef<number>(0);
  const targetPathRef = useRef<string | null>(null);

  // Sync pathRef.current when browser native navigation occurs (e.g. back button)
  useEffect(() => {
    if (!turningRef.current) {
      pathRef.current = pathname;
    }
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    if (href === pathRef.current || turningRef.current) return;

    const from = PAGE_ORDER[pathRef.current] ?? 0;
    const to   = PAGE_ORDER[href] ?? 0;
    setDirection(to >= from ? 'forward' : 'backward');
    setTurning(true);
    turningRef.current = true;
    setTick(v => v + 1);
    
    targetPathRef.current = href;
    transitionStartRef.current = Date.now();

    // Route changes while the vellum sheet fully covers the viewport.
    setTimeout(() => { router.push(href); }, 560);
  }, [router]);

  const onPageMounted = useCallback(() => {
    if (!turningRef.current) return;

    const elapsed = Date.now() - transitionStartRef.current;
    // Keep vellum sheet covered for at least 600ms total
    const remainingTime = Math.max(0, 600 - elapsed);

    setTimeout(() => {
      setTurning(false);
      turningRef.current = false;
      targetPathRef.current = null;
      pathRef.current = pathname;
    }, remainingTime);
  }, [pathname]);

  return (
    <Ctx.Provider value={{ direction, turning, tick, navigate, onPageMounted }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePageTransition = () => useContext(Ctx);
