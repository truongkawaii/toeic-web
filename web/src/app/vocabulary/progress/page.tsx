import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { VocabProgressView } from "@/components/vocabulary/progress-view";

export const metadata: Metadata = { title: "Từ vựng – Tiến độ" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <VocabProgressView />
    </Suspense>
  );
}
