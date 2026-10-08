import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Cộng đồng" };

export default function Page() {
  return <ComingSoon icon={MessagesSquare} title="Cộng đồng" phase="giai đoạn 5" description="Nơi hỏi đáp, chia sẻ kinh nghiệm thi và cùng nhau giữ chuỗi ngày học. Tính năng đang được hoàn thiện." />;
}
