'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type FeaturedMember = {
  name: string;
  roleKo: string;
  photo: string;
  palette: [string, string, string];
};

export default function FeaturedGrid({ members }: { members: FeaturedMember[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 880px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6 max-[880px]:grid-cols-2 max-[880px]:mx-4 max-[880px]:gap-4">
      {members.map((m, i) => {
        const isHovered = hovered === i;
        const showColor = isMobile || isHovered;
        const showOverlay = !isMobile && isHovered;

        return (
          <div key={m.name} className="flex justify-center">
            <div className="w-4/5">
              <div
                className="aspect-3/4 relative overflow-hidden cursor-pointer"
                style={{
                  transform: isHovered && !isMobile ? 'scale(1.03)' : 'none',
                  transition: 'transform 0.5s',
                  zIndex: isHovered ? 10 : 'auto',
                }}
                onMouseEnter={() => !isMobile && setHovered(i)}
                onMouseLeave={() => !isMobile && setHovered(null)}
              >
                {m.photo ? (
                  <Image
                    src={`https://res.cloudinary.com/dmbiqatia/image/upload/w_300,h_400,c_fill,g_face,f_auto,q_auto/${m.photo}`}
                    alt={m.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                    style={{ filter: showColor ? 'grayscale(0)' : 'grayscale(1)', transition: 'filter 0.5s' }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${m.palette[0]} 0%, ${m.palette[1]} 60%, ${m.palette[2]} 100%)`,
                      filter: showColor ? 'grayscale(0)' : 'grayscale(1)',
                      transition: 'filter 0.5s',
                    }}
                  >
                    <span className="font-en italic font-bold text-[64px] text-white/40 select-none leading-none">
                      {m.name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Desktop hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col justify-end pb-4 px-3"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)',
                    transform: showOverlay ? 'translateY(0%)' : 'translateY(-100%)',
                    transition: 'transform 0.5s ease-out',
                  }}
                >
                  <div className="font-ko font-bold text-[14px] text-white leading-snug">{m.name}</div>
                  <div className="font-ko text-[11px] text-white/75 mt-0.5">{m.roleKo}</div>
                </div>
              </div>

              {/* Mobile caption */}
              {isMobile && (
                <div className="pt-2 text-center">
                  <div className="font-ko font-bold text-[13px] text-ink">{m.name}</div>
                  <div className="font-ko text-[10px] text-ink-mute mt-0.5">{m.roleKo}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
