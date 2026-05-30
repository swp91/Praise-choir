import type { Metadata } from "next";
import { getHomeData } from "@/lib/supabase/choir";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = { title: "Overview · 프레이즈찬양대" };

export default async function HomePage() {
  const home = await getHomeData();

  return (
    <main className="main-content min-h-screen p-0 relative bg-cream animate-fadeIn">
      <HomeClient home={home} />
    </main>
  );
}
