'use client';
import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PAGE_ORDER: Record<string, number> = {
  '/': 1, '/members': 2, '/leaders': 3,
  '/practice': 4, '/events': 5, '/gallery': 6,
};

export type Direction = 'forward' | 'backward';
export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

interface TransitionCtx {
  direction: Direction;
  phase: TransitionPhase;
  turning: boolean;
  tick: number;
  navigate: (href: string) => void;
  onCoverComplete: () => void;
  onPageMounted: () => void;
  onRevealComplete: () => void;
}

const Ctx = createContext<TransitionCtx>({
  direction: 'forward',
  phase: 'idle',
  turning: false,
  tick: 0,
  navigate: () => {},
  onCoverComplete: () => {},
  onPageMounted: () => {},
  onRevealComplete: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const phaseRef = useRef<TransitionPhase>('idle');
  const [direction, setDirection] = useState<Direction>('forward');
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [tick, setTick] = useState(0);
  const turning = phase !== 'idle';

  const transitionStartRef = useRef<number>(0);
  const targetPathRef = useRef<string | null>(null);

  const setTransitionPhase = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  // Sync pathRef.current when browser native navigation occurs (e.g. back button)
  useEffect(() => {
    if (phaseRef.current === 'idle') {
      pathRef.current = pathname;
    }
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    if (href === pathRef.current || phaseRef.current !== 'idle') return;

    const from = PAGE_ORDER[pathRef.current] ?? 0;
    const to   = PAGE_ORDER[href] ?? 0;
    setDirection(to >= from ? 'forward' : 'backward');
    
    targetPathRef.current = href;
    transitionStartRef.current = Date.now();
    setTick(v => v + 1);
    setTransitionPhase('covering');
  }, [setTransitionPhase]);

  const onCoverComplete = useCallback(() => {
    if (phaseRef.current !== 'covering') return;

    const targetPath = targetPathRef.current;
    if (!targetPath) {
      setTransitionPhase('revealing');
      return;
    }

    setTransitionPhase('covered');
    router.push(targetPath);
  }, [router, setTransitionPhase]);

  const onPageMounted = useCallback(() => {
    if (phaseRef.current !== 'covered') return;
    if (targetPathRef.current && pathname !== targetPathRef.current) return;

    const elapsed = Date.now() - transitionStartRef.current;
    // Vellum sheet covers the screen fully at 560ms. Guarantee at least 600ms total cover time.
    const minimumCoveredTime = 600;
    const remainingTime = Math.max(0, minimumCoveredTime - elapsed);

    window.setTimeout(() => {
      if (phaseRef.current === 'covered') {
        setTransitionPhase('revealing');
      }
    }, remainingTime);
  }, [pathname, setTransitionPhase]);

  const onRevealComplete = useCallback(() => {
    if (phaseRef.current !== 'revealing') return;

    pathRef.current = targetPathRef.current ?? pathname;
    targetPathRef.current = null;
    setTransitionPhase('idle');
  }, [pathname, setTransitionPhase]);

  return (
    <Ctx.Provider
      value={{
        direction,
        phase,
        turning,
        tick,
        navigate,
        onCoverComplete,
        onPageMounted,
        onRevealComplete,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const usePageTransition = () => useContext(Ctx);
