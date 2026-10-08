import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { TestsLibraryView } from "@/components/tests/tests-views";

export const metadata: Metadata = { title: "Đề thi TOEIC" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TestsLibraryView />
    </Suspense>
  );
}
