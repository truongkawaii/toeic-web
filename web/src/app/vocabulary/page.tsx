import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { VocabLearnView } from "@/components/vocabulary/learn-view";

export const metadata: Metadata = { title: "Từ vựng – Học" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <VocabLearnView />
    </Suspense>
  );
}
