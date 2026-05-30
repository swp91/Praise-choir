import type { Metadata } from "next";
import HeroBlock from "@/components/HeroBlock";
import SectionCap from "@/components/SectionCap";
import Footer from "@/components/Footer";
import FeaturedGrid from "@/components/FeaturedGrid";
import AnimatedHeroTitle from "@/components/AnimatedHeroTitle";
import { UsersIcon, MusicIcon, CalendarIcon, CrownIcon } from "@/components/icons";
import { getHomeData } from "@/lib/supabase/choir";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

export default async function HomePage() {
  const home = await getHomeData();
  const stats = [
    { num: String(home.stats.people), label: "Choristers", sub: "총 단원", Icon: UsersIcon },
    { num: String(home.stats.sections), label: "Sections", sub: "파트 · 악단", Icon: MusicIcon },
    { num: String(home.stats.events), label: "Events / Year", sub: "연중행사", Icon: CalendarIcon },
    { num: home.stats.goalsRoman, label: "Annual Aims", sub: `${home.year} 목표`, Icon: CrownIcon },
  ];

  // 7대 목표 비대칭 아티스틱 그리드 열 너비 계산 헬퍼
  const getCardSpan = (index: number) => {
    if (index === 0 || index === 1) return 'col-span-12 md:col-span-6';
    if (index >= 2 && index <= 4) {
      // 3개 열의 중간 카드는 살짝 내려앉혀 물결 비대칭 형성 (데스크톱에만 적용)
      const stagger = index % 2 === 0 ? 'md:translate-y-4' : '';
      return `col-span-12 md:col-span-4 ${stagger}`;
    }
    return 'col-span-12 md:col-span-6';
  };

  return (
    <main className="min-h-screen pt-8 pb-15 px-8 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20 relative overflow-hidden">
      
      {/* 1. 백그라운드 라틴어 워터마크 마키 연출 (성스러운 입체감 부여) */}
      <div className="absolute top-8 left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
              SANCTUS · GLORIA · KYRIE · ALLELUIA
            </span>
          ))}
        </div>
      </div>

      <HeroBlock
        eyebrow="Ministry Overview"
        title={<AnimatedHeroTitle text="프레이즈 찬양대" />}
        titleKo="광진교회 프레이즈찬양대"
        watermark="SANCTUS · GLORIA · KYRIE"
        watermarkMid="PRAISE · ALLELUIA"
      />

      {/* 2. 글래스모피즘 와이드 통계 그리드 */}
      <div className="grid grid-cols-4 border border-line bg-card/65 backdrop-blur-md rounded-2xl shadow-[0_12px_32px_rgba(42,38,32,0.03)] mt-7 overflow-hidden max-[880px]:grid-cols-2 max-[880px]:mx-4 relative z-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className="px-7 py-6.5 flex flex-col justify-center border-r border-line-soft last:border-r-0 max-[880px]:border-b max-[880px]:border-line-soft max-[880px]:nth-[2n]:border-r-0 max-[880px]:nth-last-[-n+2]:border-b-0 transition-colors duration-300 hover:bg-cream/35"
          >
            <div className="flex items-center gap-3 text-gold-deep [&>svg]:w-7 [&>svg]:h-7 md:[&>svg]:w-8 md:[&>svg]:h-8">
              <s.Icon />
              <div className="font-en italic text-[36px] md:text-[42px] font-extralight leading-none tracking-tight">
                {s.num}
              </div>
            </div>
            <div className="font-en text-[10px] tracking-[0.28em] uppercase text-ink-mute mt-2.5">
              {s.label}
            </div>
            <div className="text-[12px] text-ink-soft mt-1 font-ko font-medium">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 3. 2026 주제어 영역 (성스러운 라디얼 백라이트 광채 포함) */}
      <div className="my-10 max-[880px]:my-8 relative z-10">
        <SectionCap label="Annual Theme" note={`— A.D. ${toRoman(home.year)}`} />
        
        <div className="relative border border-line rounded-2xl overflow-hidden min-h-[300px] shadow-[0_18px_45px_rgba(42,38,32,0.06)] max-[880px]:mx-4 max-[880px]:min-h-[240px]">
          {/* Background photo — sepia + darken */}
          <div
            className="absolute left-0 right-0 bottom-0 bg-center bg-cover"
            style={{
              top: '-20%',
              backgroundImage: `url('${home.heroBackgroundUrl}')`,
              backgroundPosition: home.heroBackgroundPosition,
              filter: "sepia(50%) brightness(0.48) contrast(1.1) saturate(0.8)",
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-[#1a1208]/98 via-[#1a1208]/75 to-[#1a1208]/15" />
          
          {/* 성스러운 빛 무리 (백라이트 이식) */}
          <div
            className="absolute inset-y-[-20%] -left-12 w-[60%] pointer-events-none z-0 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(184, 154, 90, 0.22) 0%, rgba(26, 18, 8, 0) 75%)',
              filter: 'blur(16px)',
            }}
          />

          {/* Text content */}
          <div className="relative z-10 px-10 py-12 max-w-[55%] max-[880px]:max-w-full max-[880px]:px-6 max-[880px]:py-8">
            <div className="font-en text-[11px] tracking-[0.35em] uppercase text-gold mb-5 opacity-90">{home.year} Theme</div>
            <h2 className="font-ko font-bold text-[clamp(22px,2.4vw,32px)] leading-[1.48] text-[#f5edd8] tracking-wide">
              {home.themeKo.split(' ').slice(0, -2).join(' ')}
              <br />
              {home.themeKo.split(' ').slice(-2).join(' ')}
            </h2>
            <div className="mt-4.5 font-en italic text-gold text-[15px] opacity-90 leading-relaxed">
              &ldquo;{home.themeEn}&rdquo;
            </div>
            <div className="mt-7 w-14 h-[1.5px] bg-gold opacity-50" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/church.svg"
              alt="광진교회"
              className="mt-6 w-20 mix-blend-screen opacity-35"
            />
          </div>
        </div>
      </div>

      {/* 4. 7대 목표 비대칭 아티스틱 그리드 카드 영역 */}
      {home.goalsList && home.goalsList.length > 0 && (
        <div className="my-12 max-[880px]:my-8 relative z-10">
          <SectionCap label="Annual Goals" note="— 올해의 실천 목표" />
          
          <div className="grid grid-cols-12 gap-6 max-[880px]:gap-4 max-[880px]:mx-4 md:pb-8">
            {home.goalsList.map((goal, i) => (
              <div
                key={i}
                className={`border border-line-soft bg-card/45 backdrop-blur-xs rounded-xl px-7 py-6.5 flex flex-col justify-start relative overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(184,154,90,0.06)] hover:border-gold/60 ${getCardSpan(i)}`}
              >
                {/* 로마자 골드 인덱스 */}
                <span className="font-en text-[22px] md:text-[25px] font-bold text-gold/30 tracking-wider select-none leading-none mb-3 block">
                  {toRoman(i + 1)}
                </span>
                
                {/* 목표 국문 내용 */}
                <p className="font-ko text-[13.5px] md:text-[14.5px] font-semibold leading-relaxed text-ink tracking-wide">
                  {goal}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 섬기는 대원진 그리드 영역 */}
      <div className="my-10 max-[880px]:my-8 relative z-10">
        <SectionCap label="Member Gallery" note="— 대원 더보기" noteHref="/members" />
        <FeaturedGrid members={home.featured} />
      </div>

      <Footer />
    </main>
  );
}
