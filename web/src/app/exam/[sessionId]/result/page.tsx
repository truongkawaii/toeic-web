import type { Metadata } from "next";
import { Suspense } from "react";
import { ExamResult } from "@/components/exam/exam-result";
import { PageSkeleton } from "@/components/layout/page-skeleton";

export const metadata: Metadata = { title: "Kết quả bài làm", robots: { index: false } };

export default async function ResultPage({ params }: PageProps<"/exam/[sessionId]/result">) {
  const { sessionId } = await params;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExamResult sessionId={sessionId} />
    </Suspense>
  );
}
