import { getHomeData, getMembersData, getLeadersData, getPracticeData } from "@/lib/supabase/choir";
import { imageUrl } from "@/lib/media";
import HomeClient from "@/components/HomeClient";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function HomePage() {
  const queryClient = new QueryClient();

  // 1. 서버 측에서 미리 데이터 pre-fetch
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["home"],
      queryFn: getHomeData,
    }),
    queryClient.prefetchQuery({
      queryKey: ["members"],
      queryFn: getMembersData,
    }),
    queryClient.prefetchQuery({
      queryKey: ["leaders"],
      queryFn: getLeadersData,
    }),
    queryClient.prefetchQuery({
      queryKey: ["practice"],
      queryFn: getPracticeData,
    }),
  ]);

  // 사전 이미지 프리로딩을 위해 쿼리 캐시 데이터 확보
  const home = queryClient.getQueryData<Awaited<ReturnType<typeof getHomeData>>>(["home"]);
  const members = queryClient.getQueryData<Awaited<ReturnType<typeof getMembersData>>>(["members"]) || [];
  const leaders = queryClient.getQueryData<Awaited<ReturnType<typeof getLeadersData>>>(["leaders"]) || { conductors: [], officers: [] };

  const preloadSet = new Set<string>();

  // 1. 대원 사진 (160x160)
  members.forEach((part) => {
    part.members.forEach((m) => {
      if (m.photo) {
        preloadSet.add(imageUrl(m.photo, { width: 160, height: 160, crop: 'fill', gravity: 'face' }));
      }
    });
  });

  // 2. 지휘자/반주자/편곡자 스태프 사진 (240x240)
  leaders.conductors.forEach((c) => {
    if (c.photo) {
      preloadSet.add(imageUrl(c.photo, { width: 240, height: 240, crop: 'fill', gravity: 'face' }));
    }
  });

  // 3. 임원진 사진 (256x256)
  leaders.officers.forEach((o) => {
    if (o.photo) {
      preloadSet.add(imageUrl(o.photo, { width: 256, height: 256, crop: 'fill', gravity: 'face' }));
    }
  });

  const preloadPhotos = Array.from(preloadSet).filter(Boolean);

  const introPhotos = home?.introImages && home.introImages.length > 0
    ? home.introImages.slice(0, 6)
    : ["/intro_1.webp", "/intro_2.webp", "/intro_3.webp", "/intro_4.webp", "/intro_5.webp", "/ensemble.webp"];
  const heroBackgroundUrl = home?.heroBackgroundUrl || '/praise_photo.png';

  return (
    <main className="main-content min-h-screen p-0 relative bg-cream animate-fadeIn">
      {/* 인트로 및 히어로 백그라운드 이미지 사전 로드 (Next.js 이미지 최적화 매칭) */}
      {introPhotos.map((url) => {
        const optimizedUrl = `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`;
        return <link key={url} rel="preload" as="image" href={optimizedUrl} />;
      })}
      <link rel="preload" as="image" href={`/_next/image?url=${encodeURIComponent(heroBackgroundUrl)}&w=1080&q=75`} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeClient preloadPhotos={preloadPhotos} />
      </HydrationBoundary>
    </main>
  );
}
