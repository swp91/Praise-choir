'use client';

import { useState, useMemo } from 'react';
import type { PraiseVideo } from '@/lib/praise-archive';

type Props = {
  videos: PraiseVideo[];
};

export default function ArchiveClient({ videos }: Props) {
  // 1. Group videos by Year and Month
  const groupedData = useMemo(() => {
    const result: Record<number, Record<number, PraiseVideo[]>> = {};

    videos.forEach((video) => {
      // video.praiseDate is formatted as YYYY-MM-DD
      const dateParts = video.praiseDate.split('-');
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);

      if (isNaN(year) || isNaN(month)) return;

      if (!result[year]) {
        result[year] = {};
      }
      if (!result[year][month]) {
        result[year][month] = [];
      }
      result[year][month].push(video);
    });

    return result;
  }, [videos]);

  // Extract years sorted descending
  const years = useMemo(() => {
    return Object.keys(groupedData)
      .map(Number)
      .sort((a, b) => b - a);
  }, [groupedData]);

  // Initial active year and month selection
  const [activeYear, setActiveYear] = useState<number | null>(() => {
    return years[0] || null;
  });

  const [activeMonth, setActiveMonth] = useState<number | null>(() => {
    if (years[0] && groupedData[years[0]]) {
      const months = Object.keys(groupedData[years[0]])
        .map(Number)
        .sort((a, b) => b - a);
      return months[0] || null;
    }
    return null;
  });

  // Keep track of which video lyrics are expanded
  const [expandedLyricsId, setExpandedLyricsId] = useState<string | null>(null);

  // Active YouTube video ID to play in modal
  const [activePlayVideoId, setActivePlayVideoId] = useState<string | null>(null);

  // Handle year click: switch year and activate the latest month of that year
  function handleYearSelect(year: number) {
    setActiveYear(year);
    const months = Object.keys(groupedData[year])
      .map(Number)
      .sort((a, b) => b - a);
    setActiveMonth(months[0] || null);
    setExpandedLyricsId(null); // Close lyrics on switch
  }

  // Handle month click
  function handleMonthSelect(month: number) {
    setActiveMonth(month);
    setExpandedLyricsId(null);
  }

  // Generate and download lyrics as a text file
  function handleDownloadLyrics(video: PraiseVideo) {
    if (!video.lyrics) return;

    const formattedContent = `[찬양 아카이브 가사]\n곡명: ${video.title}\n찬양 일자: ${video.praiseDate}\n\n========================================\n\n${video.lyrics}`;
    
    const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${video.praiseDate}_${video.title}_가사.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 3. Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Get active videos based on filters and search query
  const activeVideos = useMemo(() => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      return videos
        .filter((video) => video.title.toLowerCase().includes(query))
        .sort((a, b) => new Date(b.praiseDate).getTime() - new Date(a.praiseDate).getTime());
    }

    if (activeYear && activeMonth && groupedData[activeYear]?.[activeMonth]) {
      return groupedData[activeYear][activeMonth].sort(
        (a, b) => new Date(b.praiseDate).getTime() - new Date(a.praiseDate).getTime()
      );
    }
    return [];
  }, [activeYear, activeMonth, groupedData, searchQuery, videos]);

  // Format date helper (e.g. 2026-06-22 -> 06월 22일 주일)
  function formatPraiseDate(dateStr: string) {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[1]}월 ${parts[2]}일 주일`;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf9f0] text-[#171717]">
      {/* 1. Header (Hamburger space preserved in upper right) */}
      <header className="relative w-full border-b border-line/60 bg-[#fdf9f0]/90 backdrop-blur-sm px-6 py-6 pt-10 min-[881px]:py-8 z-40">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-2 pr-16 min-[881px]:pr-0">
          <p className="font-en text-[10px] tracking-[0.34em] uppercase text-gold-deep">
            Choir Video Archive
          </p>
          <h1 className="font-ko text-[clamp(22px,3.5vw,34px)] font-bold text-ink leading-tight">
            찬양 영상 아카이브
          </h1>
          <p className="font-ko text-[13px] text-ink-soft max-w-[600px] leading-relaxed">
            매주 주일 하나님께 올려드린 은혜로운 찬양의 기록입니다. 연도와 월을 선택하여 찾아볼 수 있습니다.
          </p>
        </div>
      </header>

      {/* 2. Content Layout */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-8 min-[881px]:flex-row z-30">
        {/* Left Side: Filter Panels */}
        <aside className="w-full min-[881px]:w-[240px] flex flex-col gap-6 shrink-0">
          {/* Year selection */}
          <div className="flex flex-col gap-2">
            <h2 className="font-ko text-[12px] font-bold text-gold-deep uppercase tracking-wider">연도 선택</h2>
            <div className="flex flex-wrap gap-2 min-[881px]:flex-col">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`px-4 py-2 text-left font-en text-[14px] font-bold border transition duration-150 cursor-pointer ${
                    activeYear === year
                      ? 'border-gold-deep bg-[#171717] text-[#fdf9f0]'
                      : 'border-line bg-card hover:border-gold'
                  }`}
                >
                  {year}년
                </button>
              ))}
            </div>
          </div>

          {/* Month selection (Horizontal list in mobile, Vertical accordion list in desktop) */}
          {activeYear && groupedData[activeYear] && (
            <div className="flex flex-col gap-2 border-t border-line/60 pt-4 min-[881px]:border-none min-[881px]:pt-0">
              <h2 className="font-ko text-[12px] font-bold text-gold-deep uppercase tracking-wider">월별 선택</h2>
              <div className="flex flex-wrap gap-2 min-[881px]:flex-col">
                {Object.keys(groupedData[activeYear])
                  .map(Number)
                  .sort((a, b) => b - a)
                  .map((month) => {
                    const videoCount = groupedData[activeYear][month].length;
                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthSelect(month)}
                        className={`px-3 py-1.5 font-ko text-[13px] border transition duration-150 flex items-center justify-between gap-3 cursor-pointer min-[881px]:px-4 min-[881px]:py-2.5 ${
                          activeMonth === month
                            ? 'border-gold-deep bg-gold-deep text-cream font-bold'
                            : 'border-line bg-card hover:border-gold'
                        }`}
                      >
                        <span>{month}월</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                          activeMonth === month ? 'bg-ink/20 text-cream' : 'bg-cream text-ink-soft border border-line'
                        }`}>
                          {videoCount}곡
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </aside>

        {/* Right Side: Video List (Grouped with clear date titles) */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <h3 className="font-ko text-[16px] font-bold text-ink flex flex-wrap items-center gap-2">
              {searchQuery.trim() !== '' ? (
                <>
                  <span className="text-gold-deep">&ldquo;{searchQuery}&rdquo;</span> 검색 결과
                </>
              ) : (
                <>
                  <span className="font-en text-[18px] text-gold-deep">{activeYear}</span>년
                  <span className="font-en text-[18px] text-gold-deep">{activeMonth}</span>월 찬양 영상
                </>
              )}
              <span className="font-ko text-[12px] font-normal text-ink-soft ml-2">
                (총 {activeVideos.length}개)
              </span>
            </h3>
            
            <div className="relative w-full sm:w-[280px] shrink-0">
              <input
                type="text"
                placeholder="곡 제목으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-line bg-card pl-9 pr-8 py-2 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                  />
                </svg>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition cursor-pointer bg-transparent border-none p-0"
                  aria-label="검색어 초기화"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {activeVideos.length === 0 ? (
            <div className="border border-line bg-card py-20 text-center font-ko text-[14px] text-ink-soft">
              선택한 연도와 월에 등록된 영상이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {activeVideos.map((video) => {
                const isLyricsExpanded = expandedLyricsId === video.id;

                return (
                  <article
                    key={video.id}
                    className="border border-line bg-card hover:shadow-md transition duration-200"
                  >
                    <div className="flex flex-col sm:flex-row min-h-[170px]">
                      {/* Thumbnail section */}
                      <div className="relative w-full sm:w-[260px] aspect-[16/9] sm:aspect-auto bg-[#171717] overflow-hidden shrink-0 group">
                        {video.youtubeId ? (
                          <>
                            {/* Standard YouTube mqdefault thumbnail */}
                            <img
                               src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            {/* Hover Overlay Play Icon */}
                            <button
                              type="button"
                              onClick={() => setActivePlayVideoId(video.youtubeId)}
                              className="absolute inset-0 flex items-center justify-center bg-ink/40 group-hover:bg-ink/55 transition cursor-pointer"
                              aria-label="찬양 영상 재생"
                            >
                              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-cream/95 text-gold-deep shadow-md transform group-hover:scale-110 transition duration-150">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-6 h-6 translate-x-[2px]"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cream/30">
                            No Video ID
                          </div>
                        )}
                      </div>

                      {/* Video Info Description Section */}
                      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-ko text-[12px] font-bold text-gold-deep">
                            {formatPraiseDate(video.praiseDate)}
                          </div>
                          <h4 className="font-ko text-[18px] font-bold text-ink leading-snug">
                            {video.title}
                          </h4>
                        </div>

                        {/* Expand/Download Controls */}
                        <div className="flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
                          {video.lyrics ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedLyricsId(isLyricsExpanded ? null : video.id)
                              }
                              className="border border-line bg-[#fdf9f0] px-3.5 py-1.5 font-ko text-[12px] text-ink transition hover:border-gold hover:text-gold-deep cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{isLyricsExpanded ? '가사 접기 ▲' : '가사 보기 ▾'}</span>
                            </button>
                          ) : (
                            <span className="font-ko text-[11px] text-ink-soft bg-cream/80 px-2.5 py-1.5 border border-line/40 rounded-sm">
                              가사 미등록
                            </span>
                          )}

                          {video.lyrics && (
                            <button
                              type="button"
                              onClick={() => handleDownloadLyrics(video)}
                              className="border border-line bg-[#fdf9f0] px-3.5 py-1.5 font-ko text-[12px] text-ink transition hover:border-gold hover:text-gold-deep cursor-pointer flex items-center gap-1.5"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-3.5 h-3.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                />
                              </svg>
                              <span>가사 다운로드 (.txt)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Expandable Lyrics Accordion Area */}
                    {isLyricsExpanded && video.lyrics && (
                      <div className="border-t border-line/60 bg-cream/35 px-6 py-5 animate-in fade-in slide-in-from-top-3 duration-250">
                        <div className="max-w-[700px] font-ko text-[14px] leading-relaxed text-ink-soft whitespace-pre-wrap select-text">
                          {video.lyrics}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 4. Cinematic YouTube Play Modal */}
      {activePlayVideoId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-[1000px] flex flex-col gap-4">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActivePlayVideoId(null)}
              className="absolute right-0 top-[-44px] text-[#fdf9f0] hover:text-gold-deep transition duration-150 flex items-center gap-1 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-ko text-[13px] font-bold">닫기</span>
            </button>

            {/* Video Player 16:9 Responsive Embed */}
            <div className="w-full aspect-[16/9] bg-black shadow-2xl border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${activePlayVideoId}?autoplay=1&rel=0`}
                title="Praise Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
