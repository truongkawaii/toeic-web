import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { ListeningView } from "@/components/learning/listening-view";

export const metadata: Metadata = { title: "Luyện nghe TOEIC" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ListeningView />
    </Suspense>
  );
}
