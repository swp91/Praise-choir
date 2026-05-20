'use client';
import { motion } from 'framer-motion';
import { usePageTransition } from '@/lib/transition';

const COLS = 10;
const ROWS = 7;
const TILE_DUR = 0.52;
const STAGGER = 0.044;

// Two alternating gold tones for texture
const COLORS = ['#b89a5a', '#8a6f2f'] as const;

export default function PageTransition() {
  const { turning, direction, tick } = usePageTransition();
  if (!turning) return null;

  const forward = direction === 'forward';

  return (
    <div
      key={tick}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {Array.from({ length: COLS * ROWS }).map((_, idx) => {
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);

        // diagonal index controls wave direction
        const diag = forward
          ? col + row
          : (COLS - 1 - col) + (ROWS - 1 - row);

        return (
          <motion.div
            key={idx}
            style={{ backgroundColor: COLORS[(col + row) % 2] }}
            initial={{ scale: 0, borderRadius: '50%' }}
            animate={{
              scale:        [0, 1.08, 1,    1,    0],
              borderRadius: ['50%', '6%', '2%', '6%', '50%'],
            }}
            transition={{
              duration: TILE_DUR,
              delay: diag * STAGGER,
              times: [0, 0.28, 0.38, 0.68, 1],
              ease: ['easeOut', 'easeOut', 'linear', 'easeIn'],
            }}
          />
        );
      })}
    </div>
  );
}
