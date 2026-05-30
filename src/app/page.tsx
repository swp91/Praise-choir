import type { Metadata } from "next";
import Link from "next/link";
import SectionCap from "@/components/SectionCap";
import Footer from "@/components/Footer";
import FeaturedGrid from "@/components/FeaturedGrid";
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
      
      {/* 1. 하이엔드 레퍼런스 스타일 프리미엄 풀스크린 Hero 섹션 */}
      <section className="relative w-full h-[calc(100vh-6rem)] min-h-[640px] border border-line bg-card rounded-3xl overflow-hidden flex flex-col justify-between p-10 md:p-14 mb-12 shadow-[0_24px_55px_rgba(42,38,32,0.05)] max-[880px]:rounded-none max-[880px]:mx-0 max-[880px]:w-full max-[880px]:h-[calc(100vh-4rem)] max-[880px]:min-h-[560px] max-[880px]:p-6 max-[880px]:mb-8 z-10">
        
        {/* 영화 같은 시네마틱 백그라운드 (극적인 어둠의 그라데이션) */}
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-[2s] scale-102"
          style={{
            backgroundImage: `url('${home.heroBackgroundUrl}')`,
            backgroundPosition: home.heroBackgroundPosition,
            filter: "sepia(35%) brightness(0.26) contrast(1.15) saturate(0.95)",
          }}
        />
        
        {/* 깊이감을 위한 다중 암전 그라데이션 레이어 */}
        {/* 1) 좌측 타이포그래피 대비용 블랙 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0906] via-[#0c0906]/85 to-transparent z-0" />
        {/* 2) 하단 메타 바 대비용 어두운 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0906]/90 via-[#0c0906]/35 to-transparent z-0" />
        
        {/* 성스러운 은은한 골드 백라이트 빛무리 */}
        <div
          className="absolute inset-y-[-20%] -left-12 w-[60%] pointer-events-none z-0 rounded-full opacity-60 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(184, 154, 90, 0.16) 0%, rgba(12, 9, 6, 0) 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* 좌측 대형 타이포그래피 콘텐츠 */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[75%] md:max-w-[55%] max-[880px]:max-w-full">
          {/* 미니멀 아이브로우 & 가로선 */}
          <div className="flex items-center gap-3 mb-6 opacity-90 select-none">
            <span className="font-en text-[10px] tracking-[0.24em] uppercase text-gold-deep">
              [01] Praise Choir Ministry
            </span>
            <div className="w-10 h-[1.2px] bg-gold-deep/40" />
          </div>

          {/* 메인 타이틀: 명조 & 금빛 그라데이션과 이탤릭 영문의 격조 높은 만남 */}
          <h1 className="font-ko text-[clamp(34px,4.5vw,66px)] font-light leading-[1.14] text-[#f5edd8] tracking-tight mb-5 select-none">
            광진교회 <br className="hidden md:inline" />
            <span className="font-bold bg-gradient-to-r from-[#e6c787] via-gold to-[#e6c787] bg-clip-text text-transparent">
              프레이즈 찬양대
            </span>
            <span className="font-en font-extralight italic text-[clamp(26px,3.5vw,48px)] text-gold-deep/70 ml-3.5 align-baseline shrink-0">
              Praise
            </span>
          </h1>

          {/* 올해의 표어 (서브 카피) */}
          <p className="font-ko text-[14px] md:text-[15.5px] text-ink-mute tracking-[0.04em] leading-relaxed max-w-md opacity-85 mb-8.5 font-medium">
            “오직 하나님을 기뻐함으로 승리하는 프레이즈”
            <span className="block font-en italic text-gold text-[12px] opacity-80 mt-1.5 font-normal tracking-wide">
              &ldquo;{home.themeEn}&rdquo;
            </span>
          </p>

          {/* 마이크로 인터랙티브 버튼 세트 */}
          <div className="flex flex-wrap gap-4.5">
            <Link
              href="/members"
              className="px-6 py-3 bg-[#1e160e]/85 border border-gold/45 rounded-full font-ko text-[13px] font-semibold text-[#f5edd8] transition-all duration-300 hover:scale-[1.03] hover:border-gold hover:shadow-[0_0_24px_rgba(184,154,90,0.18)] hover:bg-[#261d12] flex items-center gap-2.5 group"
            >
              대원 소개
              <span className="transition-transform duration-300 group-hover:translate-x-1 font-en">→</span>
            </Link>
            <Link
              href="/practice"
              className="px-6 py-3 border border-line-soft rounded-full font-ko text-[13px] font-medium text-ink-soft transition-all duration-300 hover:scale-[1.03] hover:text-ink hover:border-gold/45 hover:bg-cream/8"
            >
              연습 및 목표
            </Link>
          </div>
        </div>

        {/* 2026 로고 워터마크 데코 */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 select-none z-10 pointer-events-none opacity-20 hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/church.svg"
            alt="광진교회"
            className="w-24 mix-blend-screen"
          />
        </div>

        {/* 하단 미니멀 통계 메타 바 (The Sacred Metrics Line) */}
        <div className="relative z-10 mt-auto w-full pt-7 border-t border-gold/15">
          <div className="grid grid-cols-4 gap-6 max-[880px]:grid-cols-2">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-3.5 transition-colors duration-300 hover:bg-[#f5edd8]/3 px-2 py-1 rounded-lg">
                <div className="text-gold [&>svg]:w-5 [&>svg]:h-5 shrink-0 opacity-80">
                  <s.Icon />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="font-en text-[20px] md:text-[24px] font-extralight text-[#f5edd8] tracking-tight">
                      {s.num}
                    </span>
                    <span className="font-en text-[8px] tracking-[0.2em] uppercase text-gold-deep shrink-0">
                      {s.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink-mute font-ko mt-1">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 2. 백그라운드 라틴어 워터마크 마키 연출 (자연스럽게 뒤로 흐르도록 배치) */}
      <div className="absolute top-[calc(100vh-2rem)] left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/5 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
              SANCTUS · GLORIA · KYRIE · ALLELUIA
            </span>
          ))}
        </div>
      </div>

      {/* 3. 7대 목표 비대칭 아티스틱 그리드 카드 영역 */}
      {home.goalsList && home.goalsList.length > 0 && (
        <div className="my-16 max-[880px]:my-10 relative z-10">
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

      {/* 4. 섬기는 대원진 그리드 영역 */}
      <div className="my-14 max-[880px]:my-10 relative z-10">
        <SectionCap label="Member Gallery" note="— 대원 더보기" noteHref="/members" />
        <FeaturedGrid members={home.featured} />
      </div>

      <Footer />
    </main>
  );
}

