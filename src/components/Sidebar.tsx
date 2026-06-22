'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Crest from './Crest';
import { usePageTransition } from '@/lib/transition';

const PAGES = [
  { key: 'home',     href: '/',         en: 'Overview',     ko: '메인',   num: '01' },
  { key: 'members',  href: '/members',  en: 'Choristers',   ko: '대원',   num: '02' },
  { key: 'leaders',  href: '/leaders',  en: 'Leadership', ko: '임원',   num: '03' },
  { key: 'practice', href: '/practice', en: 'Schedule & Vision', ko: '연습 및 비전', num: '04' },
  { key: 'events',   href: '/events',   en: 'Calendar',     ko: '일정',   num: '05' },
  { key: 'gallery',  href: '/gallery',  en: 'Gallery',      ko: '갤러리', num: '06' },
  { key: 'archive',  href: '/archive',  en: 'Archive',      ko: '아카이브', num: '07' },
  { key: 'admin',    href: '/admin',    en: 'Console',      ko: '관리',   num: '08' },
] as const;

export default function Sidebar() {
  const path = usePathname();
  const { navigate } = usePageTransition();
  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);

  return (
    <aside className="hidden min-[881px]:flex flex-col w-[248px] fixed top-0 left-0 h-screen bg-cream border-r border-line z-100 overflow-y-auto">
      <Link className="flex flex-col items-center px-5 py-8 pb-6 border-b border-line gap-3" href="/">
        <div className="w-13 h-13"><Crest /></div>
        <div className="font-en text-[11px] tracking-[0.28em] uppercase text-ink-mute text-center leading-[1.4]">
          PRAISE · CHOIR
        </div>
        <div className="font-ko text-[17px] text-ink font-bold tracking-[0.06em]">프레이즈찬양대</div>
      </Link>

      <nav className="flex-1 py-4">
        <ul>
          {PAGES.map((p) => {
            const active = isActive(p.href);
            return (
              <li key={p.key}>
                <Link
                  href={p.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => { e.preventDefault(); navigate(p.href); }}
                  className={`flex items-baseline gap-3 px-5 py-3.5 font-en text-[13px] tracking-[0.18em] uppercase border-l-2 transition-all duration-200 ${
                    active
                      ? 'text-gold-deep border-gold-deep bg-gold/10 font-medium'
                      : 'text-ink-soft border-transparent hover:text-ink hover:border-gold hover:bg-gold/5'
                  }`}
                >
                  <span className="italic text-gold text-[13px] w-5 shrink-0">{p.num}</span>
                  <span>
                    {p.en}
                    <span className="block font-ko text-[11px] tracking-[0.06em] text-ink-soft normal-case mt-0.5">{p.ko}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 py-4 font-en italic text-[10px] tracking-[0.2em] text-ink-mute border-t border-line text-center">
        A.D. MMXXVI
      </div>
    </aside>
  );
}
