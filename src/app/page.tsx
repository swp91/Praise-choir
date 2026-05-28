import type { Metadata } from "next";
import MobileHeader from "@/components/MobileHeader";
import HeroBlock from "@/components/HeroBlock";
import SectionCap from "@/components/SectionCap";
import Footer from "@/components/Footer";
import FeaturedGrid from "@/components/FeaturedGrid";
import AnimatedHeroTitle from "@/components/AnimatedHeroTitle";
import { UsersIcon, MusicIcon, CalendarIcon, CrownIcon } from "@/components/icons";
import { getHomeData } from "@/lib/supabase/choir";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

export default async function HomePage() {
  const home = await getHomeData();
  const stats = [
    { num: String(home.stats.people), label: "Choristers", sub: "총 단원", Icon: UsersIcon },
    { num: String(home.stats.sections), label: "Sections", sub: "파트 · 악단", Icon: MusicIcon },
    { num: String(home.stats.events), label: "Events / Year", sub: "연중행사", Icon: CalendarIcon },
    { num: home.stats.goalsRoman, label: "Annual Aims", sub: `${home.year} 목표`, Icon: CrownIcon },
  ];

  return (
    <main className="min-h-screen pt-8 pb-15 px-30 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Ministry Overview"
        title={<AnimatedHeroTitle text="프레이즈 찬양대" />}
        titleKo="광진교회 프레이즈찬양대"
        watermark="SANCTUS · GLORIA · KYRIE"
        watermarkMid="PRAISE · ALLELUIA"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 border border-line bg-card mt-7 max-[880px]:grid-cols-2 max-[880px]:mx-4">
        {stats.map((s, i) => (
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
            backgroundImage: `url('${home.heroBackgroundUrl}')`,
            backgroundPosition: home.heroBackgroundPosition,
            filter: "sepia(60%) brightness(0.55) contrast(1.1) saturate(0.7)",
          }}
        />
        {/* Gradient overlay: left dark → right reveals photo */}
        <div className="absolute inset-0 bg-linear-to-r from-[#1a1208]/95 via-[#1a1208]/70 to-[#1a1208]/10" />
        {/* Optional top/bottom vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-[#1a1208]/30 via-transparent to-[#1a1208]/40" />

        {/* Text content */}
        <div className="relative z-10 px-9 py-10 max-w-[55%] max-[880px]:max-w-full max-[880px]:px-6 max-[880px]:py-8">
          <div className="font-en text-[11px] tracking-[0.35em] uppercase text-gold mb-5 opacity-80">{home.year} Theme</div>
          <p className="font-ko font-bold text-[clamp(20px,2.2vw,30px)] leading-[1.5] text-[#f5edd8]">
            {home.themeKo.split(' ').slice(0, -2).join(' ')}
            <br />
            {home.themeKo.split(' ').slice(-2).join(' ')}
          </p>
          <div className="mt-4 font-en italic text-gold text-[15px] opacity-80">
            &ldquo;{home.themeEn}&rdquo;
          </div>
          <div className="mt-7 w-12 h-px bg-gold opacity-40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/church.svg"
            alt="광진교회"
            className="mt-6 w-20 mix-blend-screen opacity-30"
          />
        </div>
      </div>


      <SectionCap label="Member Gallery" note="— 대원 더보기" noteHref="/members" />

      {/* Polaroid-style member photo grid */}
      <FeaturedGrid members={home.featured} />

      <Footer />
    </main>
  );
}
