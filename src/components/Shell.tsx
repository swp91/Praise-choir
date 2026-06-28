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

  useEffect(() => {
    const isApp = process.env.NEXT_PUBLIC_BUILD_TARGET === 'app';
    if (!isApp) return;

    let activeListener: any = null;

    import('@capacitor/app').then(({ App }) => {
      App.addListener('backButton', (event) => {
        if (event.canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      }).then((l) => {
        activeListener = l;
      });
    }).catch((err) => {
      console.error('Failed to load Capacitor App plugin', err);
    });

    return () => {
      if (activeListener) {
        activeListener.remove();
      }
    };
  }, []);

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
