import type { Metadata } from "next";
import { Info } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Về TOEIC Practice" };

export default function Page() {
  return <ComingSoon icon={Info} title="Về TOEIC Practice" phase="giai đoạn 5" description="Giới thiệu dự án, phương pháp học và đội ngũ phát triển sẽ được cập nhật tại đây." />;
}
