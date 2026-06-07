'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from './Header';
import PageTransition from './PageTransition';
import { TransitionProvider, usePageTransition } from '@/lib/transition';

type Props = { children: React.ReactNode };

function PageMountReporter({ children }: { children: React.ReactNode }) {
  const { onPageMounted } = usePageTransition();
  const pathname = usePathname();

  useEffect(() => {
    onPageMounted();
  }, [pathname, onPageMounted]);

  return <>{children}</>;
}

export default function Shell({ children }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <TransitionProvider>
      <div className="min-h-screen">
        <Header />
        <PageMountReporter>{children}</PageMountReporter>
        <PageTransition />
      </div>
    </TransitionProvider>
  );
}
