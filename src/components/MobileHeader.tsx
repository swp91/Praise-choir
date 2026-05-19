import Crest from './Crest';

export default function MobileHeader() {
  return (
    <header className="flex min-[881px]:hidden items-center gap-3 px-4 py-3.5 border-b border-line bg-cream">
      <div className="w-8 h-8 shrink-0"><Crest /></div>
      <div>
        <div className="font-en text-[11px] tracking-[0.26em] uppercase text-ink">PRAISE CHOIR</div>
        <div className="font-ko text-[9px] text-ink-mute mt-0.5">프레이즈찬양대</div>
      </div>
    </header>
  );
}
