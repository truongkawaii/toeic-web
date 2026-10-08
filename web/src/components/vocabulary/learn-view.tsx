"use client";

import { BookOpen, Eye, Gamepad2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { WordListDialog } from "@/components/vocabulary/shared";
import { VOCAB_COLLECTIONS, VOCAB_SETS } from "@/lib/mock/fixtures";
import { useQueryParam } from "@/lib/use-query-param";
import type { VocabSet } from "@/types/domain";

export function VocabLearnView() {
  const [col, setCol] = useQueryParam("set", "2026", VOCAB_COLLECTIONS.map((c) => c.id));
  const chips = VOCAB_COLLECTIONS.map((c) => ({ ...c, count: VOCAB_SETS.filter((s) => s.collectionId === c.id).length }));
  const sets = useMemo(() => VOCAB_SETS.filter((s) => s.collectionId === col), [col]);
  const [viewing, setViewing] = useState<VocabSet | null>(null);

  return (
    <div className="space-y-6">
      <ChipGroup label="Bộ từ" items={chips} value={col} onChange={(v) => setCol(v)} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sets.map((s, i) => <SetCard key={s.id} set={s} delay={Math.min(i, 12) * 25} onView={() => setViewing(s)} />)}
      </div>
      <WordListDialog open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `${viewing.tag} · ${viewing.label}` : ""} count={viewing?.total} />
    </div>
  );
}

function SetCard({ set, delay, onView }: { set: VocabSet; delay: number; onView: () => void }) {
  const { comingSoon } = useToast();
  const pct = (set.learned / set.total) * 100;
  return (
    <article className="card card-hover relative flex animate-fade-up flex-col overflow-hidden p-5" style={{ animationDelay: `${delay}ms` }}>
      <span aria-hidden className="absolute left-0 top-0 h-[3px] rounded-r-full bg-primary transition-[width] duration-700" style={{ width: `${Math.max(pct, 2)}%` }} />
      <span className="badge badge-primary w-fit px-3 py-1 text-[13px]">{set.tag}</span>
      <h3 className="mt-3 text-xl font-semibold text-ink">{set.label}</h3>
      <p className="mt-1 text-[17px] font-semibold text-primary tabular-nums" aria-label={`Đã học ${set.learned} trên ${set.total} từ`}>
        {set.learned}/{set.total}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button type="button" className="btn btn-outline btn-sm px-2" onClick={onView}><Eye className="size-4" /> Xem từ</button>
        <button type="button" className="btn btn-outline btn-sm px-2" onClick={() => comingSoon("Flashcard")}><BookOpen className="size-4" /> Học</button>
        <button type="button" className="btn btn-outline btn-sm px-2" onClick={() => comingSoon("Game ghép từ")}><Gamepad2 className="size-4" /> Chơi</button>
      </div>
    </article>
  );
}
