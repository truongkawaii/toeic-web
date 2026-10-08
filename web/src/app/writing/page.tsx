import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { WritingView } from "@/components/learning/writing-view";

export const metadata: Metadata = { title: "Luyện viết TOEIC" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WritingView />
    </Suspense>
  );
}
