import type { Metadata } from "next";
import { ExamRunner } from "@/components/exam/exam-runner";

export const metadata: Metadata = { title: "Phòng thi", robots: { index: false } };

export default async function ExamPage({ params }: PageProps<"/exam/[sessionId]">) {
  const { sessionId } = await params;
  return <ExamRunner sessionId={sessionId} />;
}
