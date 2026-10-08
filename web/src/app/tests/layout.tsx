import { ClipboardCheck } from "lucide-react";
import { PageHero } from "@/components/learning/page-hero";
import { TestTabs } from "@/components/tests/tests-views";

export default function TestsLayout({ children }: LayoutProps<"/tests">) {
  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Đề thi TOEIC mô phỏng sát đề thi thật"
        title={["Luyện đề thi", "TOEIC thực tế"]}
        description="Làm đề theo chế độ thi thật hoặc luyện tập từng Part, xem lại đáp án và theo dõi điểm số qua từng lượt."
        icon={ClipboardCheck}
      />
      <TestTabs />
      {children}
    </div>
  );
}
