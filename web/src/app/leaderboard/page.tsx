import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";

export const metadata: Metadata = { title: "Bảng xếp hạng" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeaderboardView />
    </Suspense>
  );
}
