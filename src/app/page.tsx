import type { Metadata } from "next";
import Image from "next/image";
import MobileHeader from "@/components/MobileHeader";
import HeroBlock from "@/components/HeroBlock";
import SectionCap from "@/components/SectionCap";
import Footer from "@/components/Footer";
import { UsersIcon, MusicIcon, CalendarIcon, CrownIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

const STATS = [
  { num: "46", label: "Choristers",   sub: "총 단원",   Icon: UsersIcon },
  { num: "6",  label: "Sections",     sub: "파트 · 악단", Icon: MusicIcon },
  { num: "12", label: "Events / Year",sub: "연중행사",  Icon: CalendarIcon },
  { num: "VII",label: "Annual Aims",  sub: "2026 목표", Icon: CrownIcon },
];

const PALETTES = [
  ["#d4c4a0", "#b89a5a", "#8a7040"],
  ["#c4b0a8", "#a08070", "#705040"],
  ["#b0c4b0", "#80a080", "#507050"],
  ["#b0b4c4", "#808090", "#504060"],
];

const FEATURED = [
  { name: "김시혜 집사", roleKo: "지휘" },
  { name: "이희숙 집사", roleKo: "반주" },
  { name: "박대섭 장로", roleKo: "대장" },
  { name: "김성만 집사", roleKo: "총무" },
];

export default function HomePage() {
  const featured = FEATURED.map((f, i) => ({ ...f, palette: PALETTES[i] }));

  return (
    <main className="min-h-screen pt-8 pb-15 px-30 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Ministry Overview"
        title="프레이즈 찬양대"
        titleKo="광진교회 프레이즈찬양대"
        watermark="SANCTUS · GLORIA · KYRIE"
        watermarkMid="PRAISE · ALLELUIA"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 border border-line bg-card mt-7 max-[880px]:grid-cols-2 max-[880px]:mx-4">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="px-7 py-5.5 border-r border-line-soft last:border-r-0 max-[880px]:border-b max-[880px]:border-line-soft max-[880px]:nth-[2n]:border-r-0 max-[880px]:nth-last-[-n+2]:border-b-0"
          >
            <div className="flex items-center gap-3 text-gold-deep [&>svg]:w-8 [&>svg]:h-8">
              <s.Icon />
              <div className="font-en italic text-[36px] leading-none">
                {s.num}
              </div>
            </div>
            <div className="font-en text-[10px] tracking-[0.26em] uppercase text-ink-mute mt-2">
              {s.label}
            </div>
            <div className="text-[12px] text-ink-soft mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <SectionCap label="Annual Theme" note="— A.D. MMXXVI" />

      {/* Theme card */}
      <div className="relative border border-line overflow-hidden min-h-[280px] max-[880px]:mx-4 max-[880px]:min-h-[240px]">
        {/* Background photo — sepia + darken */}
        <div
          className="absolute left-0 right-0 bottom-0 bg-center bg-cover"
          style={{
            top: '-20%',
            backgroundImage: "url('/praise_photo.png')",
            backgroundPosition: "center 30%",
            filter: "sepia(60%) brightness(0.55) contrast(1.1) saturate(0.7)",
          }}
        />
        {/* Gradient overlay: left dark → right reveals photo */}
        <div className="absolute inset-0 bg-linear-to-r from-[#1a1208]/95 via-[#1a1208]/70 to-[#1a1208]/10" />
        {/* Optional top/bottom vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-[#1a1208]/30 via-transparent to-[#1a1208]/40" />

        {/* Text content */}
        <div className="relative z-10 px-9 py-10 max-w-[55%] max-[880px]:max-w-full max-[880px]:px-6 max-[880px]:py-8">
          <div className="font-en text-[11px] tracking-[0.35em] uppercase text-gold mb-5 opacity-80">2026 Theme</div>
          <p className="font-ko font-bold text-[clamp(20px,2.2vw,30px)] leading-[1.5] text-[#f5edd8]">
            오직 하나님을 기뻐함으로
            <br />
            승리하는 프레이즈
          </p>
          <div className="mt-4 font-en italic text-gold text-[15px] opacity-80">
            &ldquo;Rejoicing in the Lord, We Triumph&rdquo;
          </div>
          <div className="mt-7 w-12 h-px bg-gold opacity-40" />
          <Image
            src="/church.svg"
            alt="광진교회"
            width={80}
            height={60}
            className="mt-6 max-w-20 mix-blend-screen opacity-30"
          />
        </div>
      </div>


      <SectionCap label="Member Gallery" note="— 대원 미리보기" />

      {/* Polaroid-style member photo grid */}
      <div className="grid grid-cols-4 gap-6 max-[880px]:grid-cols-2 max-[880px]:mx-4 max-[880px]:gap-4">
        {featured.map((m) => (
          <div key={m.name} className="flex flex-col items-center">
            <div className="group relative bg-white border border-line-soft p-2.5 pb-10 w-[70%] shadow-[0_2px_16px_rgba(42,38,32,0.08)] hover:shadow-[0_8px_32px_rgba(42,38,32,0.18)] hover:scale-105 hover:rotate-[-10deg] hover:z-10 transition-all duration-700 cursor-pointer">
              <div className="aspect-3/4 relative overflow-hidden">
                <div
                  className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500 ease-out flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${m.palette[0]} 0%, ${m.palette[1]} 60%, ${m.palette[2]} 100%)`,
                  }}
                >
                  <span className="font-en italic font-bold text-[64px] text-white/40 select-none leading-none">
                    {m.name.charAt(0)}
                  </span>
                </div>
                {/* Hover reveal */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 transform-[translateY(-100%)] group-hover:transform-[translateY(0%)] transition-transform duration-500 ease-out">
                  <div className="font-ko font-bold text-[14px] text-white text-center leading-snug px-2">{m.name}</div>
                  <div className="font-ko text-[11px] text-white/75 mt-1">{m.roleKo}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </main>
  );
}
