"use client";

import { BookOpen, Brain, ChartColumn, FolderHeart, Minus, Plus, Search, Volume2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SAMPLE_WORDS } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";

const TABS = [
  { id: "learn", label: "Học", icon: BookOpen, href: "/vocabulary" },
  { id: "progress", label: "Tiến độ", icon: ChartColumn, href: "/vocabulary/progress" },
  { id: "mine", label: "Từ vựng của tôi", icon: FolderHeart, href: "/vocabulary/mine" },
  { id: "method", label: "Thuật toán học từ", icon: Brain, href: "/vocabulary/method" },
] as const;

export function VocabTabs() {
  const pathname = usePathname();
  const active = TABS.find((t) => t.href !== "/vocabulary" && pathname.startsWith(t.href))?.id ?? "learn";
  return <SegTabs label="Mục từ vựng" items={TABS} value={active} />;
}

/** Danh sách từ (Xem từ). Nghe phát âm dùng Web Speech API nếu trình duyệt hỗ trợ. */
export function WordListDialog({ open, onClose, title, count }: { open: boolean; onClose: () => void; title: string; count?: number }) {
  const [q, setQ] = useState("");
  const { toast } = useToast();
  const words = useMemo(
    () => SAMPLE_WORDS.filter((w) => `${w.term} ${w.meaning}`.toLowerCase().includes(q.trim().toLowerCase())),
    [q],
  );

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast("Trình duyệt không hỗ trợ phát âm", { tone: "warning" });
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={`${count ?? SAMPLE_WORDS.length} từ · hiển thị ${SAMPLE_WORDS.length} từ mẫu trong bản demo`}
      size="lg"
    >
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <label htmlFor="word-q" className="sr-only">Tìm từ</label>
        <input id="word-q" type="search" className="input pl-11" placeholder="Tìm từ hoặc nghĩa…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {words.length === 0 ? (
        <p className="py-10 text-center text-muted">Không có từ nào khớp “{q}”.</p>
      ) : (
        <ul className="divide-y divide-line-soft pb-3">
          {words.map((w) => (
            <li key={w.id} className="flex items-start gap-3 py-3">
              <button type="button" className="icon-btn mt-0.5 shrink-0 bg-primary-tint text-primary" aria-label={`Nghe phát âm ${w.term}`} onClick={() => speak(w.term)}>
                <Volume2 className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <b className="text-[17px] text-ink">{w.term}</b>
                  <span className="text-sm text-muted">{w.ipa}</span>
                  <span className="badge bg-canvas text-muted">{w.pos}</span>
                </p>
                <p className="text-[15px] font-medium text-ink-soft">{w.meaning}</p>
                <p className="mt-0.5 text-sm italic text-muted">{w.example}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}

export function DailyGoalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Mục tiêu từ mới mỗi ngày" description="Hệ thống ưu tiên từ đến hạn ôn trước, sau đó mới lấy từ mới theo mục tiêu này." size="sm">
      {open && <DailyGoalForm onDone={onClose} />}
    </Dialog>
  );
}

function DailyGoalForm({ onDone }: { onDone: () => void }) {
  const { vocabGoal, setVocabGoal } = useDemoStore();
  const { toast } = useToast();
  const [n, setN] = useState(vocabGoal.newPerDay);
  const clamp = (v: number) => Math.min(100, Math.max(5, v));
  return (
    <div className="space-y-5 pb-2">
      <div className="flex items-center justify-center gap-4">
        <button type="button" className="focus-ring grid size-12 place-items-center rounded-full border border-line text-muted hover:text-primary" aria-label="Giảm" onClick={() => setN((v) => clamp(v - 5))}><Minus className="size-5" /></button>
        <p className="w-28 text-center"><span className="text-5xl font-extrabold text-primary tabular-nums">{n}</span><span className="block text-sm text-muted">từ / ngày</span></p>
        <button type="button" className="focus-ring grid size-12 place-items-center rounded-full border border-line text-muted hover:text-primary" aria-label="Tăng" onClick={() => setN((v) => clamp(v + 5))}><Plus className="size-5" /></button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {[10, 15, 20, 30, 50].map((p) => (
          <button key={p} type="button" data-active={n === p} className="chip" onClick={() => setN(p)}>{p}</button>
        ))}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={onDone}>Huỷ</button>
        <button type="button" className="btn btn-primary" onClick={() => { setVocabGoal({ newPerDay: n }); toast(`Mục tiêu mới: ${n} từ/ngày`); onDone(); }}>Lưu</button>
      </div>
    </div>
  );
}
