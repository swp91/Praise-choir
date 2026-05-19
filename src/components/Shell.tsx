import Sidebar from './Sidebar';
import TabBar from './TabBar';

type Props = { children: React.ReactNode };

export default function Shell({ children }: Props) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      {children}
      <TabBar />
    </div>
  );
}
