'use client';
import { createContext, useContext, useRef, useState, useCallback } from 'react';
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
}

const Ctx = createContext<TransitionCtx>({
  direction: 'forward', turning: false, tick: 0, navigate: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const turningRef = useRef(false);
  const [direction, setDirection] = useState<Direction>('forward');
  const [turning, setTurning] = useState(false);
  const [tick, setTick] = useState(0);

  const navigate = useCallback((href: string) => {
    if (href === pathRef.current || turningRef.current) return;

    const from = PAGE_ORDER[pathRef.current] ?? 0;
    const to   = PAGE_ORDER[href] ?? 0;
    setDirection(to >= from ? 'forward' : 'backward');
    setTurning(true);
    turningRef.current = true;
    setTick(v => v + 1);
    pathRef.current = href;

    // navigate at the moment tiles reach peak coverage (~mid-wave)
    setTimeout(() => { router.push(href); }, 600);
    // total wave: TILE_DUR(0.52) + maxDiag(15) * STAGGER(0.044) = ~1.18s
    setTimeout(() => { setTurning(false); turningRef.current = false; }, 1350);
  }, [router]);

  return (
    <Ctx.Provider value={{ direction, turning, tick, navigate }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePageTransition = () => useContext(Ctx);
