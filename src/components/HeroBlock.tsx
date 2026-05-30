type Props = {
  eyebrow: string;
  title: React.ReactNode;
  titleKo: string;
  watermark: string;
  watermarkMid?: string;
  meta?: { label: string; value: string }[];
};

export default function HeroBlock({
  eyebrow,
  title,
  titleKo,
  watermark,
  watermarkMid,
  meta,
}: Props) {
  return (
    <section className="relative pt-2 mb-7 overflow-hidden max-[880px]:pt-2 max-[880px]:px-4">
      <div className="absolute -top-1 left-0 right-0 overflow-hidden pointer-events-none select-none leading-none">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
              {watermark}
            </span>
          ))}
        </div>
      </div>
      {watermarkMid && (
        <div className="absolute bottom-6.5 left-0 right-0 overflow-hidden pointer-events-none select-none leading-none">
          <div className="animate-marquee-rev flex whitespace-nowrap">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(30px,5vw,56px)] pr-16 shrink-0">
                {watermarkMid}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 flex items-start gap-6">
        <div className="flex-1">
          <div className="font-en text-[10px] tracking-[0.32em] uppercase text-gold-deep mb-2.5">
            {eyebrow}
          </div>
          <h1 className="font-en text-[clamp(36px,4vw,56px)] font-semibold leading-[1.1] text-ink mb-3">
            {title}
          </h1>
          <div className="font-ko text-sm text-ink-mute tracking-[0.06em]">
            {titleKo}
          </div>
        </div>
        <div className="font-en text-[10px] tracking-[0.18em] uppercase text-ink-mute text-right leading-loose shrink-0 pt-1">
          {meta?.map((m, i) => (
            <span key={i}>
              {m.label}: <strong className="text-ink">{m.value}</strong>
              <br />
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 h-px bg-linear-to-r from-gold to-transparent mt-7" />
    </section>
  );
}
