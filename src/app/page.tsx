import type { Metadata } from "next";
import { getHomeData } from "@/lib/supabase/choir";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

export default async function HomePage() {
  const home = await getHomeData();

  return (
    <main className="main-content min-h-screen p-0 relative overflow-hidden bg-cream animate-fadeIn">
      
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
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[75%] md:max-w-[55%] max-[880px]:max-w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] transform transition-transform duration-500 md:-translate-y-16 -translate-y-8">
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

    </main>
  );
}
