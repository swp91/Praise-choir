'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { Member } from '@/lib/types';
import { imageUrl } from '@/lib/media';

// Birth date display helper
function BirthDisplay({ birth }: { birth: string }) {
  if (!birth || birth === '—') return <span>—</span>;
  const lunar = birth.startsWith('음');
  const date = lunar ? birth.slice(1) : birth;
  return (
    <span>
      {date}
      {lunar && <span className="ml-0.5 text-[11px]" title="음력">🌙</span>}
    </span>
  );
}

type MemberWithSubPart = Member & { subPart?: string };

type PartData = {
  key: string;
  name: string;
  nameEn: string;
  leader: string;
  members: MemberWithSubPart[];
};

type Props = {
  parts: PartData[];
};

const PART_DESIGNS = {
  soprano: {
    bg: '#F5EED9', // Linen/Beige
    text: '#2A2620', // Ink
    titleClass: 'text-gold-deep',
    poem: '가장 높은 곳에서 빛나는 천사의 목소리',
    desc: '맑고 투명한 천상의 고음으로 프레이즈 찬양의 선율을 이끕니다.',
    tagline: 'SOPRANO',
    number: '01',
  },
  alto: {
    bg: '#B45A3F', // Terracotta/Brick Red
    text: '#FFFDF9', // Cream
    titleClass: 'text-cream',
    poem: '찬양의 기둥이 되는 깊고 따뜻한 울림',
    desc: '묵묵하고 포근한 중저음으로 하모니의 풍성함을 더해줍니다.',
    tagline: 'ALTO',
    number: '02',
  },
  tenor: {
    bg: '#FFFFFF', // Pure White
    text: '#2A2620', // Ink
    titleClass: 'text-gold-deep',
    poem: '하늘을 향해 높이 뻗어가는 화려한 선율',
    desc: '시원하고 당찬 미성으로 찬양에 밝은 에너지를 부여합니다.',
    tagline: 'TENOR',
    number: '03',
  },
  bass: {
    bg: '#4E7088', // Slate Blue
    text: '#FFFDF9', // Cream
    titleClass: 'text-cream',
    poem: '모든 소리를 든든하게 받쳐주는 찬양의 기초',
    desc: '중후하고 깊은 저음으로 화성의 중심을 단단히 잡아줍니다.',
    tagline: 'BASS',
    number: '04',
  },
  band: {
    bg: '#D6C7DE', // Pastel Violet
    text: '#2A2620', // Ink
    titleClass: 'text-ink-soft',
    poem: '아름다운 악기 소리로 찬양을 완성하는 하기오스',
    desc: '현악과 관악의 조화로 성가를 더욱 입체적이고 아름답게 꾸밉니다.',
    tagline: 'HAGIOS ENSEMBLE',
    number: '05',
  },
  staff: {
    bg: '#352E27', // Warm Charcoal
    text: '#F5EED9', // Cream
    titleClass: 'text-gold',
    poem: '보이지 않는 곳에서 성가대를 지탱하는 손길',
    desc: '지휘, 반주, 편곡 및 운영진이 한마음으로 보이지 않는 곳에서 섬깁니다.',
    tagline: 'STAFF',
    number: '06',
  },
} as const;

export default function MemberGrid({ parts }: Props) {
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [showFloatingBack, setShowFloatingBack] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleExpand = useCallback((key: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setExpandedPart(key);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const handleCollapse = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setExpandedPart(null);
    setShowFloatingBack(false);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCollapse]);

  const currentPart = parts.find((p) => p.key === expandedPart);
  const design = expandedPart ? PART_DESIGNS[expandedPart as keyof typeof PART_DESIGNS] : null;

  // Staggered animation variants for member list
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.6, // Start animating children after panel fully opens (600ms)
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 18,
      },
    },
  } as const;

  // Helper to render individual member card
  const renderMemberCard = (member: Member, keyId: string) => {
    const hasPhoto = !!member.photo;
    return (
      <motion.div
        key={keyId}
        variants={itemVariants}
        className="flex flex-col group/card"
      >
        {/* Photo: Elegant Square with rounded corners */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-current/10 shadow-sm mb-3 bg-current/5 transition-transform duration-300 group-hover/card:scale-[1.02]">
          {hasPhoto ? (
            <Image
              src={imageUrl(member.photo!, { width: 200, height: 200, crop: 'fill', gravity: 'face' })}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            // Premium abstract geometric placeholder
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(184,154,90,0.12)_0%,transparent_70%)]">
              <span className="font-en text-[2rem] font-light tracking-widest opacity-25 uppercase">
                {member.name.slice(0, 1)}
              </span>
              <div className="absolute inset-0 opacity-[0.05] bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_6px)]" />
            </div>
          )}

          {/* Hover Overlay with basic card details */}
          <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            {member.phone && (
              <a
                href={`tel:${member.phone.replace(/-/g, '')}`}
                className="w-10 h-10 rounded-full bg-cream text-ink flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"
                title="전화 걸기"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Member Info */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-ko text-[14px] font-bold tracking-tight">
              {member.name}
            </span>
            {member.role && (
              <span className="font-ko text-[9px] font-medium px-1.5 py-0.5 rounded border border-current/30 scale-90 origin-left">
                {member.role}
              </span>
            )}
          </div>

          {/* Birth & Phone displays below name */}
          <div className="mt-1 flex flex-col gap-0.5 font-ko text-[11px] opacity-75 [font-variant-numeric:tabular-nums]">
            {member.birth && member.birth !== '—' && (
              <div className="flex items-center gap-1">
                <span className="opacity-60">🎂</span>
                <BirthDisplay birth={member.birth} />
              </div>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone.replace(/-/g, '')}`}
                className="flex items-center gap-1 hover:underline decoration-current/40"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="opacity-60">📞</span>
                <span>{member.phone}</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-ko">
      {/* 1. Main Grid View */}
      <div className={`grid grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2 w-full h-full ${isTransitioning ? 'pointer-events-none' : ''}`}>
        {parts.map((part) => {
          const ptDesign = PART_DESIGNS[part.key as keyof typeof PART_DESIGNS];
          const isDarkBg = ptDesign.text === '#FFFDF9' || ptDesign.text === '#F5EED9';

          return (
            <motion.div
              key={part.key}
              layoutId={`panel-${part.key}`}
              onClick={() => handleExpand(part.key)}
              className="relative flex flex-col justify-between p-6 md:p-10 cursor-pointer select-none group overflow-hidden"
              style={{ backgroundColor: ptDesign.bg, color: ptDesign.text }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              {/* Top Row: Korean Tagline & Number */}
              <div className="flex justify-between items-start z-10">
                <span className="font-ko text-[12px] tracking-[0.1em] font-bold opacity-75">
                  {part.name}
                </span>
                <span className="font-en text-[12px] md:text-[14px] font-semibold opacity-30 italic">
                  {ptDesign.number}
                </span>
              </div>

              {/* Middle Row: Massive English Typography & Poetic Statement */}
              <div className="my-auto z-10 flex flex-col gap-1.5">
                <span className={`font-en font-light leading-none tracking-[0.08em] uppercase font-serif select-none mb-1 ${
                  ptDesign.tagline.length > 8
                    ? 'text-[clamp(1.3rem,4.2vw,2.4rem)]'
                    : 'text-[clamp(1.8rem,5.2vw,3.6rem)]'
                }`}>
                  {ptDesign.tagline}
                </span>
                <p className="text-[12px] md:text-[13px] font-light leading-relaxed tracking-wide opacity-80 max-w-[85%] break-keep">
                  {ptDesign.poem}
                </p>
              </div>

              {/* Bottom Row: Info & Action indicator */}
              <div className="flex justify-between items-end z-10 pt-4">
                <span className="font-en text-[11px] tracking-[0.08em] opacity-60">
                  {part.members.length} VOICES
                </span>
                <span className="flex items-center gap-1.5 text-[11px] tracking-[0.08em] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>VIEW MEMBERS</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 animate-pulse">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>

              {/* Background elegant grid pattern on white/light cells */}
              {!isDarkBg && (
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 2. Fullscreen Expanded Member View */}
      <AnimatePresence>
        {expandedPart && currentPart && design && (
          <motion.div
            layoutId={`panel-${expandedPart}`}
            className="fixed inset-0 z-50 overflow-y-auto p-6 md:p-12"
            style={{ backgroundColor: design.bg, color: design.text }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              setShowFloatingBack(scrollTop > 80);
            }}
          >
            {/* Header: Back & Details */}
            <div className="flex justify-between items-center border-b border-current/10 pb-4 mb-6 md:mb-8 shrink-0">
              <button
                type="button"
                onClick={handleCollapse}
                className="flex items-center gap-2 text-[12px] md:text-[13px] font-medium tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border border-current/25 hover:bg-current/5 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>BACK</span>
              </button>
              <div className="text-right">
                <span className="font-en text-[11px] md:text-[12px] tracking-[0.2em] font-medium opacity-60">
                  {design.tagline}
                </span>
              </div>
            </div>

            {/* Left/Top Info Panel */}
            <div className="mb-6 md:mb-8 shrink-0">
              <h1 className={`font-ko text-[2.5rem] md:text-[3.5rem] font-bold tracking-tight leading-none ${design.titleClass}`}>
                {currentPart.name}
              </h1>
              <p className="text-[14px] md:text-[16px] font-medium tracking-wide mt-2 opacity-90">
                {design.poem}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[12px] md:text-[13px] opacity-75">
                <span>총원 {currentPart.members.length}명</span>
                {currentPart.leader && (
                  <>
                    <span className="opacity-45">•</span>
                    <span>
                      {expandedPart === 'staff' ? '지휘자' : '파트장'}: {currentPart.leader}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Members Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="mt-6 md:mt-8 pb-12"
            >
              {expandedPart === 'soprano' ? (
                <div className="flex flex-col gap-8 md:gap-12">
                  {/* Soprano 1 */}
                  <div>
                    <h3 className="font-ko text-[16px] md:text-[18px] font-bold border-b border-current/15 pb-2 mb-4 tracking-wide opacity-80 uppercase">
                      소프라노 1
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-7">
                      {currentPart.members
                        .filter((m) => m.subPart === '소프라노 1')
                        .map((member, idx) => renderMemberCard(member, `sop1-${idx}`))}
                    </div>
                  </div>

                  {/* Soprano 2 */}
                  <div>
                    <h3 className="font-ko text-[16px] md:text-[18px] font-bold border-b border-current/15 pb-2 mb-4 tracking-wide opacity-80 uppercase">
                      소프라노 2
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-7">
                      {currentPart.members
                        .filter((m) => m.subPart === '소프라노 2')
                        .map((member, idx) => renderMemberCard(member, `sop2-${idx}`))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-7">
                  {currentPart.members.map((member, idx) => renderMemberCard(member, `mem-${idx}`))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Back Button for Mobile (Fixed bottom-right) */}
      <AnimatePresence>
        {expandedPart && showFloatingBack && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            type="button"
            onClick={handleCollapse}
            className="fixed bottom-6 right-6 z-[60] flex items-center justify-center w-12 h-12 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.16)] bg-cream text-ink border border-line-soft transition-transform duration-200 hover:scale-105 active:scale-95 md:hidden"
            title="뒤로 가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
