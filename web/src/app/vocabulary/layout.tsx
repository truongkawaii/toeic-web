import { BookOpen } from "lucide-react";
import { PageHero } from "@/components/learning/page-hero";
import { VocabTabs } from "@/components/vocabulary/shared";

export default function VocabularyLayout({ children }: LayoutProps<"/vocabulary">) {
  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Spaced Repetition System"
        title={["Chinh phục", "Từ vựng TOEIC"]}
        description="Học theo phương pháp lặp lại ngắt quãng: đúng từ, đúng lúc, nhớ lâu mà tốn ít công sức."
        icon={BookOpen}
      />
      <VocabTabs />
      {children}
    </div>
  );
}
