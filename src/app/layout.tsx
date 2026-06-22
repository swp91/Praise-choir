import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_KR } from "next/font/google";
import Shell from "@/components/Shell";
import QueryProvider from "@/components/providers/QueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "프레이즈찬양대",
  description:
    "오직 하나님을 기뻐함으로 찬양하는 광진교회 프레이즈찬양대 공식 홈페이지입니다.",
  keywords: [
    "광진교회",
    "프레이즈찬양대",
    "찬양대",
    "광진교회 찬양대",
    "프레이즈",
    "교회 성가대",
  ],
  authors: [{ name: "광진교회 프레이즈찬양대" }],
  metadataBase: new URL("https://praisechoir.kr"),
  openGraph: {
    title: "광진교회 프레이즈찬양대 · 2026",
    description:
      "오직 하나님을 기뻐함으로 찬양하는 광진교회 프레이즈찬양대 2026 공식 홈페이지입니다.",
    url: "https://praisechoir.kr",
    siteName: "광진교회 프레이즈찬양대",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://praisechoir.kr/praise_photo.png",
        width: 1200,
        height: 630,
        alt: "광진교회 프레이즈찬양대 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "광진교회 프레이즈찬양대 · 2026",
    description:
      "오직 하나님을 기뻐함으로 찬양하는 광진교회 프레이즈찬양대 2026 공식 홈페이지입니다.",
    images: ["https://praisechoir.kr/praise_photo.png"],
  },
  verification: {
    google: "Vh7a3Esa_YA3KgTf0gpYkZkVOm2x_AQHOGK2YVv8NBo",
    other: {
      "naver-site-verification": "f485dcbed7b36c1f43c4c5583c538cbe25dc0cd8",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
