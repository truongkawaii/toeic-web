import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { ReadingView } from "@/components/learning/reading-view";

export const metadata: Metadata = { title: "Luyện đọc TOEIC" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReadingView />
    </Suspense>
  );
}
