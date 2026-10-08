import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { SpeakingView } from "@/components/learning/speaking-view";

export const metadata: Metadata = { title: "Luyện nói TOEIC" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SpeakingView />
    </Suspense>
  );
}
