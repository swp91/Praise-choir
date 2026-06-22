import type { Metadata } from 'next';
import { getWorshipVideos, type WorshipVideo } from '@/lib/worship-archive';
import WorshipArchiveClient from './WorshipArchiveClient';

export const metadata: Metadata = {
  title: '찬양 아카이브 | 찬양대',
  description: '매주 주일 하나님께 올려드린 은혜로운 찬양대 영상과 가사를 날짜별, 곡별로 정리해 모아놓은 아카이브 페이지입니다.',
  openGraph: {
    title: '찬양 아카이브 | 찬양대',
    description: '매주 주일 하나님께 올려드린 은혜로운 찬양대 영상과 가사를 날짜별, 곡별로 정리해 모아놓은 아카이브 페이지입니다.',
  },
};

export default async function WorshipArchivePage() {
  let videos: WorshipVideo[] = [];
  let dbConfigured = true;

  try {
    videos = await getWorshipVideos();
  } catch (error) {
    console.error('Failed to load worship videos in user archive page:', error);
    dbConfigured = false;
  }

  if (!dbConfigured) {
    return (
      <main className="min-h-screen bg-[#fdf9f0] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-[460px] border border-line bg-card p-8">
          <h1 className="font-ko text-[20px] font-bold text-ink mb-4">
            아카이브 데이터를 불러올 수 없습니다
          </h1>
          <p className="font-ko text-[14px] leading-relaxed text-ink-soft mb-6">
            데이터베이스 연결에 문제가 발생했거나 테이블 설정이 누락되었습니다. 관리자에게 문의해 주세요.
          </p>
          <a
            href="/"
            className="inline-block border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
          >
            메인 페이지로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  return <WorshipArchiveClient videos={videos} />;
}
