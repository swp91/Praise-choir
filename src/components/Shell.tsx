import Sidebar from './Sidebar';
import TabBar from './TabBar';
import PageTransition from './PageTransition';
import { TransitionProvider } from '@/lib/transition';

type Props = { children: React.ReactNode };

export default function Shell({ children }: Props) {
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
