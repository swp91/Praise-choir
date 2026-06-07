import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transition Loading Preview',
};

export default function TransitionTestPage() {
  return <div className="p-20 text-center font-ko">Transition Test Page</div>;
}
