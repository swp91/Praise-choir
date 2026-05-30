'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import PageTransition from './PageTransition';
import { TransitionProvider } from '@/lib/transition';

type Props = { children: React.ReactNode };

export default function Shell({ children }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <TransitionProvider>
      <div className="min-h-screen">
        <Header />
        {children}
        <PageTransition />
      </div>
    </TransitionProvider>
  );
}
