import type { Metadata } from 'next';
import Image from 'next/image';
import MobileHeader from '@/components/MobileHeader';
import HeroBlock from '@/components/HeroBlock';
import SectionCap from '@/components/SectionCap';
import ConductorPanel from '@/components/ConductorPanel';
import Footer from '@/components/Footer';
import { getLeadersData } from '@/lib/supabase/choir';
import { imageUrl } from '@/lib/media';

export const metadata: Metadata = { title: 'Serving Ministers · 프레이즈찬양대' };

export default async function LeadersPage() {
  const { conductors, officers } = await getLeadersData();

  return (
    <main className="min-h-screen p-8 pb-15 ml-62 max-[880px]:ml-0 max-[880px]:p-0 max-[880px]:pb-20">
      <MobileHeader />

      <HeroBlock
        eyebrow="Organizational Hierarchy"
        title="Serving Ministers"
        titleKo="지휘 · 반주 · 임원진"
        watermark="MINISTRI"
      />

      <SectionCap label="Music Ministry" />

      <ConductorPanel conductors={conductors} />

      <SectionCap label="Servants" />

      <div className="bg-card border border-line">
        <div className="flex items-center justify-between px-5.5 py-3.5 bg-card-head border-b border-line">
          <h3 className="font-en text-[11px] tracking-[0.26em] uppercase text-gold-deep font-semibold m-0">임원진</h3>
          <div><span className="block w-1.5 h-1.5 bg-gold rounded-full" /></div>
        </div>
        <div className="px-6 pt-5 pb-7">
          <div className="grid grid-cols-5 gap-x-4 gap-y-7 max-[880px]:grid-cols-3 max-[880px]:gap-x-3 max-[880px]:gap-y-6">
            {officers.map((o, i) => {
              const photo = o.photo;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full border-2 border-gold overflow-hidden relative mb-3 max-[880px]:w-16 max-[880px]:h-16">
                    {photo ? (
                      <Image src={imageUrl(photo, { width: 256, height: 256, crop: 'fill', gravity: 'face' })} alt={o.name} fill sizes="128px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ebe0c4_0_5px,#ddd0ad_5px_10px)]" />
                    )}
                  </div>
                  <div className="font-ko text-[13px] font-bold leading-snug max-[880px]:text-[12px]">{o.name}</div>
                  <div className="font-ko text-[11px] text-ink-soft mt-0.5 max-[880px]:text-[10px]">{o.role}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
