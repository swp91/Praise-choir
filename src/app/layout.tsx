import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Serif_KR } from 'next/font/google';
import Shell from '@/components/Shell';
import QueryProvider from '@/components/providers/QueryProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-myeongjo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '프레이즈찬양대 · 2026',
  description: '프레이즈찬양대 2026 조직과 일정을 소개합니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${cormorant.variable} ${notoSerifKR.variable}`}>
      <body>
        <QueryProvider>
          <Shell>{children}</Shell>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider>
      </body>
    </html>
  );
}
