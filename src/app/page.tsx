import type { Metadata } from "next";
import { getHomeData, getMembersData, getLeadersData } from "@/lib/supabase/choir";
import { imageUrl } from "@/lib/media";
import HomeClient from "@/components/HomeClient";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

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
  ]);

  // 사전 이미지 프리로딩을 위해 쿼리 캐시 데이터 확보
  const home = queryClient.getQueryData<any>(["home"]);
  const members = queryClient.getQueryData<any[]>(["members"]) || [];
  const leaders = queryClient.getQueryData<any>(["leaders"]) || { conductors: [], officers: [] };

  const preloadSet = new Set<string>();

  // 1. 대원 사진 (160x160)
  members.forEach((part: any) => {
    part.members.forEach((m: any) => {
      if (m.photo) {
        preloadSet.add(imageUrl(m.photo, { width: 160, height: 160, crop: 'fill', gravity: 'face' }));
      }
    });
  });

  // 2. 지휘자/반주자/편곡자 스태프 사진 (240x240)
  leaders.conductors.forEach((c: any) => {
    if (c.photo) {
      preloadSet.add(imageUrl(c.photo, { width: 240, height: 240, crop: 'fill', gravity: 'face' }));
    }
  });

  // 3. 임원진 사진 (256x256)
  leaders.officers.forEach((o: any) => {
    if (o.photo) {
      preloadSet.add(imageUrl(o.photo, { width: 256, height: 256, crop: 'fill', gravity: 'face' }));
    }
  });

  const preloadPhotos = Array.from(preloadSet).filter(Boolean);

  return (
    <main className="main-content min-h-screen p-0 relative bg-cream animate-fadeIn">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeClient preloadPhotos={preloadPhotos} />
      </HydrationBoundary>
    </main>
  );
}
