'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UsersIcon, StarIcon, ClockIcon, CalendarIcon, ImageIcon } from './icons';

const TABS = [
  { key: 'home',     href: '/',         ko: '메인',   Icon: HomeIcon },
  { key: 'members',  href: '/members',  ko: '대원',   Icon: UsersIcon },
  { key: 'leaders',  href: '/leaders',  ko: '임원',   Icon: StarIcon },
  { key: 'practice', href: '/practice', ko: '연습',   Icon: ClockIcon },
  { key: 'events',   href: '/events',   ko: '일정',   Icon: CalendarIcon },
  { key: 'gallery',  href: '/gallery',  ko: '갤러리', Icon: ImageIcon },
] as const;

export default function TabBar() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);

  return (
    <nav className="hidden max-[880px]:block fixed bottom-0 left-0 right-0 bg-cream border-t border-line z-100">
      <div className="flex items-stretch">
        {TABS.map(t => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive(t.href) ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 font-ko text-[10px] transition-colors duration-150 ${
              isActive(t.href) ? 'text-gold-deep' : 'text-ink-soft'
            }`}
          >
            <t.Icon />
            <span>{t.ko}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
