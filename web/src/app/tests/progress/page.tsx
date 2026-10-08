import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { TestsProgressView } from "@/components/tests/tests-views";

export const metadata: Metadata = { title: "Tiến độ luyện đề" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TestsProgressView />
    </Suspense>
  );
}
