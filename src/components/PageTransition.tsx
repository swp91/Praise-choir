'use client';
import { motion } from 'framer-motion';
import { usePageTransition, TransitionPhase } from '@/lib/transition';

export default function PageTransition() {
  const { phase, direction, tick, onCoverComplete, onRevealComplete } = usePageTransition();
  if (phase === 'idle') return null;

  const sign = direction === 'forward' ? 1 : -1;
  const enterX = `${sign * 112}%`;
  const exitX = `${sign * -118}%`;
  const spineX = direction === 'forward' ? '100%' : '0%';
  const spineEdge = direction === 'forward' ? { right: 0 } : { left: 0 };

  const sheetX = phase === 'revealing' ? exitX : '0%';
  const sheetRotateBack = phase === 'revealing' ? sign * -36 : 0;
  const sheetRotateFront = phase === 'revealing' ? sign * -52 : sign * -2;
  const sheetSkew = phase === 'revealing' ? sign * 10 : 0;
  const sheetScale = phase === 'revealing' ? 0.9 : 1;
  const auraX = phase === 'revealing' ? exitX : '0%';
  const auraOpacity = phase === 'revealing' ? 0 : 1;

  return (
    <div
      key={tick}
      className="score-transition"
      aria-hidden="true"
    >
      {/* Background shade */}
      <motion.div
        className="score-transition__shade"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'revealing' ? 0 : 0.28 }}
        transition={{ duration: phase === 'covering' ? 0.45 : 0.52, ease: 'easeInOut' }}
      />

      {/* Aura light */}
      <motion.div
        className="score-transition__aura"
        initial={{ x: enterX, opacity: 0, scaleX: 0.45 }}
        animate={{ x: auraX, opacity: auraOpacity, scaleX: phase === 'revealing' ? 0.58 : 1.08 }}
        transition={{ duration: phase === 'covering' ? 0.58 : 0.74, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: spineX }}
      />

      {/* Back Sheet */}
      <motion.section
        className="score-transition__sheet score-transition__sheet--back"
        initial={{ x: enterX, rotateY: sign * 42, skewX: sign * -9, scaleX: 0.9 }}
        animate={{
          x: sheetX,
          rotateY: sheetRotateBack,
          skewX: sheetSkew,
          scaleX: sheetScale,
        }}
        transition={{ duration: phase === 'covering' ? 0.62 : 0.72, ease: [0.77, 0, 0.18, 1] }}
        style={{ transformOrigin: spineX }}
      >
        <ScoreLines />
      </motion.section>

      {/* Front Sheet */}
      <motion.section
        className="score-transition__sheet score-transition__sheet--front"
        initial={{ x: enterX, rotateY: sign * 58, skewX: sign * -12, scaleX: 0.86 }}
        animate={{
          x: sheetX,
          rotateY: sheetRotateFront,
          skewX: sheetSkew,
          scaleX: sheetScale,
        }}
        transition={{ duration: phase === 'covering' ? 0.66 : 0.78, ease: [0.78, 0, 0.16, 1] }}
        style={{ transformOrigin: spineX }}
        onAnimationComplete={() => {
          if (phase === 'covering') {
            onCoverComplete();
          }
          if (phase === 'revealing') {
            onRevealComplete();
          }
        }}
      >
        <div className="score-transition__paper-grain" />
        <ScoreLines />

        {/* Rotating Seal */}
        <RotatingSeal phase={phase} />

        {/* Loading text indicator */}
        {phase === 'covered' && (
          <motion.p
            className="absolute bottom-[24vh] z-[5] font-en text-[10px] uppercase tracking-[0.32em] text-ink-soft/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.34, 0.78, 0.34] }}
            transition={{
              opacity: { duration: 1.25, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            Preparing next page
          </motion.p>
        )}
      </motion.section>

      {/* Spine */}
      <motion.div
        className="score-transition__spine"
        initial={{ x: enterX, opacity: 0 }}
        animate={{ x: phase === 'revealing' ? exitX : '0%', opacity: phase === 'revealing' ? 0 : 1 }}
        transition={{ duration: phase === 'covering' ? 0.62 : 0.72, ease: [0.76, 0, 0.24, 1] }}
        style={spineEdge}
      />
    </div>
  );
}

function RotatingSeal({ phase }: { phase: TransitionPhase }) {
  const shouldRotate = phase === 'covered';

  return (
    <motion.div
      className="score-transition__seal"
      initial={{ opacity: 0, scale: 0.74, y: 18 }}
      animate={{ 
        opacity: phase === 'revealing' ? 0 : 1, 
        scale: phase === 'revealing' ? 0.92 : 1, 
        y: phase === 'revealing' ? -12 : 0,
        rotate: shouldRotate ? 360 : 0
      }}
      transition={{ 
        opacity: { duration: 0.42, ease: 'easeOut' },
        scale: { duration: 0.42, ease: 'easeOut' },
        y: { duration: 0.42, ease: 'easeOut' },
        rotate: shouldRotate 
          ? { duration: 3.6, repeat: Infinity, ease: 'linear' }
          : { duration: 0.42, ease: 'easeOut' }
      }}
    >
      <span
        className="absolute left-1/2 top-[-5px] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-gold-deep/80 bg-gold/70 shadow-[0_0_10px_rgba(184,154,90,0.48)]"
      />
      <strong>PRAISE</strong>
    </motion.div>
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
