'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
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
        <Sidebar />
        {children}
        <TabBar />
        <PageTransition />
      </div>
    </TransitionProvider>
  );
}
