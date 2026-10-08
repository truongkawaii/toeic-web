import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { MyVocabView } from "@/components/vocabulary/mine-view";

export const metadata: Metadata = { title: "Từ của tôi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyVocabView />
    </Suspense>
  );
}
