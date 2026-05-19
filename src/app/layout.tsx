import type { Metadata } from 'next';
import { Cormorant_Garamond, Nanum_Myeongjo } from 'next/font/google';
import Shell from '@/components/Shell';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const myeongjo = Nanum_Myeongjo({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-myeongjo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '프레이즈찬양대 · 2026',
  description: '프레이즈찬양대 2026 — 오직 하나님을 기뻐함으로 승리하는 프레이즈',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${cormorant.variable} ${myeongjo.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
