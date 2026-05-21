'use client';
import { motion } from 'framer-motion';
import { usePageTransition } from '@/lib/transition';

export default function PageTransition() {
  const { turning, direction, tick } = usePageTransition();
  if (!turning) return null;

  const sign = direction === 'forward' ? 1 : -1;
  const enterX = `${sign * 112}%`;
  const exitX = `${sign * -118}%`;
  const spineX = direction === 'forward' ? '100%' : '0%';
  const spineEdge = direction === 'forward' ? { right: 0 } : { left: 0 };

  return (
    <div
      key={tick}
      className="score-transition"
      aria-hidden="true"
    >
      <motion.div
        className="score-transition__shade"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.28, 0] }}
        transition={{ duration: 1.32, times: [0, 0.36, 0.72, 1], ease: 'easeInOut' }}
      />

      <motion.div
        className="score-transition__aura"
        initial={{ x: enterX, opacity: 0, scaleX: 0.45 }}
        animate={{ x: ['0%', '0%', exitX], opacity: [0, 1, 0], scaleX: [0.45, 1.08, 0.58] }}
        transition={{ duration: 1.3, times: [0.08, 0.48, 1], ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: spineX }}
      />

      <motion.section
        className="score-transition__sheet score-transition__sheet--back"
        initial={{ x: enterX, rotateY: sign * 42, skewX: sign * -9, scaleX: 0.9 }}
        animate={{
          x: [enterX, '0%', '0%', exitX],
          rotateY: [sign * 42, 0, sign * -5, sign * -36],
          skewX: [sign * -9, 0, sign * 1.4, sign * 8],
          scaleX: [0.9, 1.035, 1, 0.95],
        }}
        transition={{ duration: 1.28, times: [0, 0.42, 0.58, 1], ease: [0.77, 0, 0.18, 1] }}
        style={{ transformOrigin: spineX }}
      >
        <ScoreLines />
      </motion.section>

      <motion.section
        className="score-transition__sheet score-transition__sheet--front"
        initial={{ x: enterX, rotateY: sign * 58, skewX: sign * -12, scaleX: 0.86 }}
        animate={{
          x: [enterX, '0%', '0%', exitX],
          rotateY: [sign * 58, sign * -2, 0, sign * -52],
          skewX: [sign * -12, 0, sign * 0.8, sign * 12],
          scaleX: [0.86, 1.065, 1, 0.88],
        }}
        transition={{ duration: 1.34, times: [0, 0.45, 0.6, 1], ease: [0.78, 0, 0.16, 1] }}
        style={{ transformOrigin: spineX }}
      >
        <div className="score-transition__paper-grain" />
        <ScoreLines />
        <motion.div
          className="score-transition__seal"
          initial={{ opacity: 0, scale: 0.74, y: 18 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.74, 1, 1.03, 0.92], y: [18, 0, 0, -12] }}
          transition={{ duration: 0.86, delay: 0.28, times: [0, 0.28, 0.68, 1], ease: 'easeOut' }}
        >
          <span>PRAISE</span>
          <strong>CHOIR</strong>
        </motion.div>
      </motion.section>

      <motion.div
        className="score-transition__spine"
        initial={{ x: enterX, opacity: 0 }}
        animate={{ x: [enterX, '0%', exitX], opacity: [0, 1, 0] }}
        transition={{ duration: 1.3, times: [0, 0.45, 1], ease: [0.76, 0, 0.24, 1] }}
        style={spineEdge}
      />
    </div>
  );
}

function ScoreLines() {
  return (
    <div className="score-transition__score">
      {Array.from({ length: 5 }).map((_, staff) => (
        <div className="score-transition__staff" key={staff}>
          {Array.from({ length: 5 }).map((__, line) => (
            <span key={line} />
          ))}
        </div>
      ))}
    </div>
  );
}
