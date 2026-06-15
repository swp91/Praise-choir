import type { Metadata } from "next";
import { getHomeData, getMembersData, getLeadersData } from "@/lib/supabase/choir";
import { imageUrl } from "@/lib/media";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

export default async function HomePage() {
  const [home, members, leaders] = await Promise.all([
    getHomeData(),
    getMembersData(),
    getLeadersData(),
  ]);

  // 대원 및 임원진 전체의 고유 이미지 원본 URL 리스트 추출
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

  return (
    <main className="main-content min-h-screen p-0 relative bg-cream animate-fadeIn">
      <HomeClient home={home} leaders={leaders} preloadPhotos={preloadPhotos} />
    </main>
  );
}
