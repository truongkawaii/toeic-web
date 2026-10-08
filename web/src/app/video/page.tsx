import type { Metadata } from "next";
import { CirclePlay } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Video bài giảng" };

export default function Page() {
  return <ComingSoon icon={CirclePlay} title="Video bài giảng" phase="giai đoạn 5" description="Thư viện video theo chủ điểm ngữ pháp và chiến thuật từng Part sẽ sớm ra mắt." />;
}
