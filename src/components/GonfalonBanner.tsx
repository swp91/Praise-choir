import type { CSSProperties, ReactNode } from 'react';

export type GonfalonBannerColor = 'navy' | 'green' | 'cream' | 'purple' | 'burgundy';

type GonfalonTheme = {
  cloth: string;
  clothDeep: string;
  clothSoft: string;
  text: string;
  textSoft: string;
  metal: string;
  metalDeep: string;
  cord: string;
};

const themes: Record<GonfalonBannerColor, GonfalonTheme> = {
  navy: {
    cloth: '#12284a',
    clothDeep: '#071426',
    clothSoft: '#254263',
    text: '#f8ead0',
    textSoft: '#d9c39a',
    metal: '#d6b36a',
    metalDeep: '#8b6a2f',
    cord: '#162842',
  },
  green: {
    cloth: '#1f4a34',
    clothDeep: '#0d2519',
    clothSoft: '#42664d',
    text: '#fbf0d6',
    textSoft: '#d9c9a4',
    metal: '#d8bd7a',
    metalDeep: '#876c36',
    cord: '#304a33',
  },
  cream: {
    cloth: '#f2ead8',
    clothDeep: '#d8c8a6',
    clothSoft: '#fff8e8',
    text: '#51402d',
    textSoft: '#7a6544',
    metal: '#c49a4a',
    metalDeep: '#8a6429',
    cord: '#a78343',
  },
  purple: {
    cloth: '#766899',
    clothDeep: '#4b3f68',
    clothSoft: '#978ab8',
    text: '#fff6e7',
    textSoft: '#eadcc7',
    metal: '#d6c0a0',
    metalDeep: '#8a7b6b',
    cord: '#5a426f',
  },
  burgundy: {
    cloth: '#6b2232',
    clothDeep: '#35101a',
    clothSoft: '#8d4452',
    text: '#fff0dd',
    textSoft: '#e2c7ad',
    metal: '#d9b16f',
    metalDeep: '#8a5b31',
    cord: '#5a1d2b',
  },
};

type GonfalonBannerProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: GonfalonBannerColor;
  size?: 'default' | 'compact';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

function DefaultIcon() {
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
      <path d="M48 10v76M10 48h76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M48 18c5.5 16.2 13.8 24.5 30 30-16.2 5.5-24.5 13.8-30 30-5.5-16.2-13.8-24.5-30-30 16.2-5.5 24.5-13.8 30-30Z" fill="currentColor" opacity="0.78" />
      <circle cx="48" cy="48" r="5" fill="currentColor" />
    </svg>
  );
}

function EndCap() {
  return (
    <svg viewBox="0 0 38 28" className="h-7 w-9 shrink-0 overflow-visible" aria-hidden="true">
      <path d="M3 14h21" stroke="url(#capGradient)" strokeWidth="5" strokeLinecap="round" />
      <path d="M18 14c6-7 10-7 16 0-6 7-10 7-16 0Z" fill="url(#capGradient)" stroke="#8a6429" strokeWidth="0.9" />
      <circle cx="8" cy="14" r="5" fill="url(#capGradient)" stroke="#8a6429" strokeWidth="0.9" />
      <defs>
        <linearGradient id="capGradient" x1="0" x2="38" y1="0" y2="28">
          <stop stopColor="#fff2c4" />
          <stop offset="0.45" stopColor="#c89a48" />
          <stop offset="1" stopColor="#7b5525" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function GonfalonBanner({
  title,
  subtitle,
  icon,
  color = 'navy',
  size = 'default',
  className = '',
  style,
  children,
}: GonfalonBannerProps) {
  const theme = themes[color] ?? themes.navy;
  const compact = size === 'compact';
  const themeStyle = {
    '--gonfalon-cloth': theme.cloth,
    '--gonfalon-cloth-deep': theme.clothDeep,
    '--gonfalon-cloth-soft': theme.clothSoft,
    '--gonfalon-text': theme.text,
    '--gonfalon-text-soft': theme.textSoft,
    '--gonfalon-metal': theme.metal,
    '--gonfalon-metal-deep': theme.metalDeep,
    '--gonfalon-cord': theme.cord,
    ...style,
  } as CSSProperties;

  return (
    <article
      className={`gonfalon-banner group relative mx-auto flex w-[clamp(8.5rem,18vw,14.5rem)] flex-col items-center ${compact ? 'pb-1 pt-6' : 'pb-3 pt-9'} text-center ${className}`}
      style={themeStyle}
    >
      <svg
        viewBox="0 0 220 116"
        className={`pointer-events-none absolute left-1/2 top-0 ${compact ? 'h-12' : 'h-20'} w-[130%] -translate-x-1/2 overflow-visible text-[var(--gonfalon-cord)]`}
        aria-hidden="true"
      >
        <path d="M34 82 110 16l76 66" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M102 16c3-9 13-9 16 0-3 9-13 9-16 0Z" fill="var(--gonfalon-metal)" stroke="var(--gonfalon-metal-deep)" strokeWidth="1.5" />
        <path d="M110 2c6 10 10 16 0 25-10-9-6-15 0-25Z" fill="var(--gonfalon-metal)" stroke="var(--gonfalon-metal-deep)" strokeWidth="1.4" />
      </svg>

      <div className="relative z-20 flex w-[118%] items-center justify-center">
        <EndCap />
        <div className={`${compact ? 'h-3.5' : 'h-5'} flex-1 rounded-full border border-[var(--gonfalon-metal-deep)] bg-[linear-gradient(180deg,#fff3c8_0%,var(--gonfalon-metal)_32%,var(--gonfalon-metal-deep)_68%,#fff0ba_100%)] shadow-[0_6px_18px_rgba(42,38,32,0.18)]`} />
        <div className="scale-x-[-1]">
          <EndCap />
        </div>
      </div>

      <div className="relative z-10 -mt-1 w-full origin-top transition-transform duration-500 ease-out [filter:drop-shadow(0_18px_24px_rgba(42,38,32,0.18))] group-hover:animate-gonfalon-sway">
        <div
          className={`relative ${compact ? 'min-h-[197px] px-3 pb-8 pt-6 max-[768px]:min-h-[140px] max-[768px]:px-2.5 max-[768px]:pb-6 max-[768px]:pt-4' : 'min-h-[clamp(15rem,34vw,25.5rem)] px-5 pb-14 pt-10'} overflow-hidden text-[var(--gonfalon-text)]`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.22), transparent 13%, rgba(255,255,255,0.12) 48%, transparent 78%, rgba(0,0,0,0.2)), radial-gradient(circle at 48% 18%, var(--gonfalon-cloth-soft), transparent 34%), linear-gradient(180deg, var(--gonfalon-cloth), var(--gonfalon-cloth-deep))',
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen [background-image:repeating-linear-gradient(90deg,transparent_0_8px,rgba(255,255,255,0.5)_9px,transparent_10px_18px),repeating-linear-gradient(0deg,rgba(255,255,255,0.18)_0_1px,transparent_1px_7px)]" />
          <svg className="pointer-events-none absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] overflow-visible text-[var(--gonfalon-metal)]" viewBox="0 0 180 330" preserveAspectRatio="none" aria-hidden="true">
            <path d="M8 8H172V275L90 322 8 275Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16 18H164V268L90 312 16 268Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.72" />
            <path d="M28 34c12 0 16-4 16-16M152 34c-12 0-16-4-16-16M28 252c12 0 16 4 16 16M152 252c-12 0-16 4-16 16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
          </svg>

          <div className="relative z-10 flex h-full min-h-[inherit] flex-col items-center justify-start">
            <div className={`${compact ? 'mb-5 h-7 w-7' : 'mb-8 h-16 w-16 max-[640px]:mb-5 max-[640px]:h-11 max-[640px]:w-11'} text-[var(--gonfalon-metal)]`}>
              {icon ?? <DefaultIcon />}
            </div>
            <h3 className={`${compact ? 'text-[18px] max-[768px]:text-[13px]' : 'text-[clamp(1.35rem,3vw,2.45rem)]'} font-ko font-bold leading-tight tracking-wide text-balance`}>
              {title}
            </h3>
            {subtitle && (
              <>
                <div className={`${compact ? 'my-3 w-10' : 'my-6 w-16 max-[640px]:my-4'} h-px bg-[var(--gonfalon-metal)]`} />
                <p className={`${compact ? 'text-[12px] max-[768px]:text-[10px]' : 'text-[clamp(0.78rem,1.4vw,1rem)]'} font-ko font-semibold leading-relaxed text-[var(--gonfalon-text-soft)] break-keep`}>
                  {subtitle}
                </p>
              </>
            )}
            {children && (
              <div className={`${compact ? 'mt-3 text-[10px] max-[768px]:text-[9px]' : 'mt-5 text-[clamp(0.68rem,1.1vw,0.82rem)]'} font-ko leading-relaxed text-[var(--gonfalon-text-soft)] break-keep`}>
                {children}
              </div>
            )}
            <svg viewBox="0 0 108 40" className={`${compact ? 'h-7 w-16' : 'h-10 w-24'} mt-auto text-[var(--gonfalon-metal)]`} aria-hidden="true">
              <path d="M54 4c6 13 13 20 31 16-16 8-23 15-31 16-8-1-15-8-31-16 18 4 25-3 31-16Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 20h32M68 20h32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="54" cy="20" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
