import type { Metadata } from "next";
import SectionCap from "@/components/SectionCap";
import Footer from "@/components/Footer";
import FeaturedGrid from "@/components/FeaturedGrid";
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

  // 7대 목표 비대칭 아티스틱 그리드 열 너비 계산 헬퍼
  const getCardSpan = (index: number) => {
    if (index === 0 || index === 1) return 'col-span-12 md:col-span-6';
    if (index >= 2 && index <= 4) {
      const stagger = index % 2 === 0 ? 'md:translate-y-4' : '';
      return `col-span-12 md:col-span-4 ${stagger}`;
    }
    return 'col-span-12 md:col-span-6';
  };

  return (
    <main className="min-h-screen ml-62 p-0 max-[880px]:ml-0 max-[880px]:p-0 relative overflow-hidden bg-cream animate-fadeIn">
      
      {/* 1. 완벽한 화면 꽉 참 (Edge-to-Edge, 100vh) 시네마틱 Hero 섹션 */}
      <section className="relative w-full h-screen flex flex-col justify-between p-10 md:p-16 pb-12 md:pb-14 z-10 overflow-hidden">
        
        {/* 생생한 원본 사진 복원 (어두운 sepia/brightness 필터 및 왜곡 전면 제거) */}
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-[3s] scale-100"
          style={{
            backgroundImage: `url('${home.heroBackgroundUrl}')`,
            backgroundPosition: home.heroBackgroundPosition,
          }}
        />
        
        {/* 텍스트 가독성을 방해하지 않는 극도로 은은한 반투명 소프트 필터 레이어 */}
        <div className="absolute inset-0 bg-black/15 z-0" />

        {/* 좌측 대형 타이포그래피 콘텐츠 (가독성 드롭 섀도우 극대화) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[75%] md:max-w-[55%] max-[880px]:max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]">
          {/* 미니멀 아이브로우 */}
          <div className="mb-6 select-none">
            <span className="font-en text-[10px] tracking-[0.24em] uppercase text-[#ffd899] opacity-95 font-semibold">
              Praise Choir
            </span>
          </div>

          {/* 메인 타이틀: 명조 & 금빛 그라데이션과 이탤릭 영문의 격조 높은 만남 */}
          <h1 className="font-ko text-[clamp(34px,4.5vw,66px)] font-light leading-[1.14] text-[#f5edd8] tracking-tight mb-5 select-none">
            광진교회 <br className="hidden md:inline" />
            <span className="font-bold bg-gradient-to-r from-[#ffd899] via-gold to-[#ffd899] bg-clip-text text-transparent">
              프레이즈 찬양대
            </span>
            <span className="font-en font-extralight italic text-[clamp(26px,3.5vw,48px)] text-[#ffd899]/80 ml-3.5 align-baseline shrink-0">
              Praise
            </span>
          </h1>

          {/* 올해의 표어 (서브 카피) */}
          <p className="font-ko text-[14px] md:text-[16px] text-[#f5edd8] tracking-[0.04em] leading-relaxed max-w-md opacity-95 font-semibold">
            “오직 하나님을 기뻐함으로 승리하는 프레이즈”
            <span className="block font-en italic text-gold text-[12px] opacity-90 mt-1.5 font-semibold tracking-wide">
              &ldquo;{home.themeEn}&rdquo;
            </span>
          </p>
        </div>

        {/* 2026 로고 워터마크 데코 */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 select-none z-10 pointer-events-none opacity-25 hidden md:block drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/church.svg"
            alt="광진교회"
            className="w-24 mix-blend-screen"
          />
        </div>

      </section>

      {/* Hero 이후 하위 콘텐츠 그룹 (기존 여백 패딩 px-8 복원 및 모바일 대응) */}
      <div className="px-8 py-16 max-[880px]:px-4 max-[880px]:py-10 max-w-7xl mx-auto relative z-10">
        
        {/* 2. 백그라운드 라틴어 워터마크 마키 연출 (첫화면 바로 하단에 흐르도록) */}
        <div className="absolute -top-10 left-0 right-0 overflow-hidden pointer-events-none select-none leading-none z-0 opacity-40">
          <div className="animate-marquee flex whitespace-nowrap">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="font-en tracking-[0.18em] uppercase text-gold/6 text-[clamp(40px,7vw,80px)] pr-20 shrink-0">
                SANCTUS · GLORIA · KYRIE · ALLELUIA
              </span>
            ))}
          </div>
        </div>

        {/* 3. 7대 목표 비대칭 아티스틱 그리드 카드 영역 */}
        {home.goalsList && home.goalsList.length > 0 && (
          <div className="mb-20 max-[880px]:mb-12 relative z-10">
            <SectionCap label="Annual Goals" note="— 올해의 실천 목표" />
            
            <div className="grid grid-cols-12 gap-6 max-[880px]:gap-4 md:pb-8">
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
        <div className="mb-20 max-[880px]:mb-12 relative z-10">
          <SectionCap label="Member Gallery" note="— 대원 더보기" noteHref="/members" />
          <FeaturedGrid members={home.featured} />
        </div>

        <Footer />
      </div>
    </main>
  );
}
