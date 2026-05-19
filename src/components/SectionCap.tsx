type Props = { label: string; note?: string };

export default function SectionCap({ label, note }: Props) {
  return (
    <div className="flex items-center gap-3.5 mt-7 mb-4 max-[880px]:mx-4">
      <span className="font-en text-[9px] tracking-[0.32em] uppercase text-gold-deep whitespace-nowrap">{label}</span>
      <span className="flex-1 h-px bg-gold opacity-35" />
      {note && <span className="font-en italic text-[10px] text-ink-mute whitespace-nowrap">{note}</span>}
    </div>
  );
}
