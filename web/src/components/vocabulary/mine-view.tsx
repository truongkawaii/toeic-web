"use client";

import {
  ArrowRight, BookA, BookOpen, ChevronDown, ChevronRight, Ellipsis, Eye, FilePlus, Flame, FolderPlus, Headphones, Layers,
  List, Lock, Pencil, PenTool, Plus, RotateCcw, Sparkles, SlidersHorizontal, FileText, Trash2, Trophy,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState, Menu } from "@/components/ui/primitives";
import { SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { DailyGoalDialog, WordListDialog } from "@/components/vocabulary/shared";
import { MY_SOURCE_TABS, MY_VOCAB_STATS, SAVED_BY_SOURCE } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { Deck, Module } from "@/types/domain";

type Source = (typeof MY_SOURCE_TABS)[number]["id"];
const SOURCE_ICON = { test: BookOpen, listening: Headphones, reading: FileText, writing: PenTool, modules: Layers, decks: FolderPlus };

type FormState =
  | { kind: "deck"; id?: string; initial?: string }
  | { kind: "module"; id?: string; initial?: string; deckId: string | null }
  | null;

export function MyVocabView() {
  const { decks, modules, vocabGoal, createDeck, renameDeck, createModule, renameModule } = useDemoStore();
  const { comingSoon, toast } = useToast();
  const [source, setSource] = useQueryParam<Source>("source", "modules", MY_SOURCE_TABS.map((t) => t.id));
  const [goalOpen, setGoalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const s = MY_VOCAB_STATS;

  const tabs = MY_SOURCE_TABS.map((t) => ({ ...t, icon: SOURCE_ICON[t.id], count: t.id === "decks" ? decks.length : undefined }));
  const standalone = modules.filter((m) => m.deckId === null);

  const submitForm = (title: string) => {
    if (!form) return;
    if (form.kind === "deck") {
      if (form.id) { renameDeck(form.id, title); toast("Đã đổi tên bộ từ"); }
      else { createDeck(title); toast(`Đã tạo bộ từ “${title}”`); setSource("decks"); }
    } else {
      if (form.id) { renameModule(form.id, title); toast("Đã đổi tên học phần"); }
      else {
        createModule(title, form.deckId);
        toast(`Đã tạo học phần “${title}”`);
        if (!form.deckId) setSource("modules");
      }
    }
    setForm(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="card grid animate-fade-up gap-6 p-5 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary py-1"><Sparkles className="size-3.5" /> MỚI</span>
            <span className="badge border border-line bg-white py-1 font-medium text-ink-soft"><Layers className="size-3.5" /> {s.sources} nguồn</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-[30px]">Học tất cả từ vựng của tôi</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Một phiên duy nhất, gom toàn bộ từ bạn đã lưu (đề thi, nghe/đọc, bộ tự tạo, từ lẻ). Hệ thống tự ưu tiên từ{" "}
            <b className="font-semibold text-warning-ink">đến hạn ôn</b> trước, rồi đến <b className="font-semibold text-primary">từ mới</b>.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => comingSoon("Phiên học tổng hợp")}>
              <BookA className="size-5" /> Bắt đầu học <ArrowRight className="size-4" />
            </button>
            <p className="text-sm text-ink-soft">
              <b className="text-warning-ink">{s.due}</b> từ đến hạn hôm nay • Mỗi ngày: <b>{vocabGoal.newPerDay}</b> từ mới{" "}
              <button type="button" onClick={() => setGoalOpen(true)} className="focus-ring inline-flex items-center gap-1 rounded font-semibold text-primary underline-offset-2 hover:underline">
                <SlidersHorizontal className="size-3.5" /> Đổi
              </button>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat icon={Flame} value={s.due} label="Đến hạn ôn" cls="border-[#fcdcab] bg-warning-soft text-warning-ink" />
          <MiniStat icon={FilePlus} value={s.fresh} label="Từ mới" cls="border-[#d4e1fb] bg-primary-tint text-primary" />
          <MiniStat icon={Trophy} value={s.mastered} label="Đã thuộc" cls="border-[#bfe8d6] bg-success-soft text-success" />
          <MiniStat icon={Layers} value={s.total} label="Tổng cộng" cls="border-line bg-canvas text-ink-soft" />
        </div>
      </section>

      {/* Sources */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegTabs label="Nguồn từ vựng" items={tabs} value={source} onChange={(v) => setSource(v)} />
        <Menu
          label="Tạo mới"
          items={[
            { label: "Học phần", icon: Layers, onSelect: () => setForm({ kind: "module", deckId: null }) },
            { label: "Bộ từ vựng", icon: FolderPlus, onSelect: () => setForm({ kind: "deck" }) },
          ]}
          trigger={({ open, toggle }) => (
            <button type="button" className="btn btn-primary w-full lg:w-auto" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
              <Plus className="size-4" /> Tạo mới <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
            </button>
          )}
        />
      </div>

      {source === "modules" && (
        standalone.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Chưa có học phần nào"
            description="Tạo học phần để bắt đầu thêm từ vựng"
            action={<button type="button" className="btn btn-primary" onClick={() => setForm({ kind: "module", deckId: null })}><Plus className="size-4" /> Tạo học phần</button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {standalone.map((m) => <ModuleCard key={m.id} mod={m} tag="Học phần" onRename={() => setForm({ kind: "module", id: m.id, initial: m.title, deckId: null })} />)}
            <AddCard label="Thêm học phần" onClick={() => setForm({ kind: "module", deckId: null })} />
          </div>
        )
      )}

      {source === "decks" && (
        decks.length === 0 ? (
          <EmptyState
            icon={FolderPlus}
            title="Chưa có bộ từ vựng"
            description="Bộ từ giúp gom nhiều học phần theo mục tiêu riêng, ví dụ “ETS 2026” hay “Từ khó Part 7”."
            action={<button type="button" className="btn btn-primary" onClick={() => setForm({ kind: "deck" })}><Plus className="size-4" /> Tạo bộ từ</button>}
          />
        ) : (
          <div className="space-y-9">
            {decks.map((d) => (
              <DeckSection
                key={d.id}
                deck={d}
                modules={modules.filter((m) => m.deckId === d.id)}
                onRename={() => setForm({ kind: "deck", id: d.id, initial: d.title })}
                onAddModule={() => setForm({ kind: "module", deckId: d.id })}
                onRenameModule={(m) => setForm({ kind: "module", id: m.id, initial: m.title, deckId: d.id })}
              />
            ))}
          </div>
        )
      )}

      {(source === "test" || source === "listening" || source === "reading" || source === "writing") && (
        <SavedSourceGrid source={source} />
      )}

      <DailyGoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} />
      <NameDialog form={form} onClose={() => setForm(null)} onSubmit={submitForm} />
    </div>
  );
}

function MiniStat({ icon: Icon, value, label, cls }: { icon: typeof Flame; value: number; label: string; cls: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${cls}`}>
      <Icon className="size-5 shrink-0" />
      <div>
        <p className="text-xl font-bold leading-tight tabular-nums">{value.toLocaleString("en-US")}</p>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{label}</p>
      </div>
    </div>
  );
}

function DeckSection({
  deck, modules, onRename, onAddModule, onRenameModule,
}: { deck: Deck; modules: Module[]; onRename: () => void; onAddModule: () => void; onRenameModule: (m: Module) => void }) {
  const { deleteDeck } = useDemoStore();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const words = modules.reduce((s, m) => s + m.total, 0);
  const learned = modules.reduce((s, m) => s + m.learned, 0);

  return (
    <section aria-label={deck.title} className="animate-fade-up">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-xl font-semibold text-ink">{deck.title}</h3>
          <span className="badge border border-line bg-white font-medium text-muted"><Lock className="size-3" /> Riêng tư</span>
          <span className="text-[15px] text-muted">{modules.length} học phần · {words} từ · {learned} đã học</span>
        </div>
        <Menu
          label={`Quản lý ${deck.title}`}
          items={[
            { label: "Thêm học phần", icon: Plus, onSelect: onAddModule },
            { label: "Đổi tên bộ từ", icon: Pencil, onSelect: onRename },
            { label: "Xoá bộ từ", icon: Trash2, onSelect: () => setConfirm(true), danger: true },
          ]}
          trigger={({ open, toggle }) => (
            <button type="button" className="icon-btn text-ink-soft" aria-label={`Tuỳ chọn bộ ${deck.title}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
              <Ellipsis className="size-5" />
            </button>
          )}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((m) => <ModuleCard key={m.id} mod={m} tag={deck.title} onRename={() => onRenameModule(m)} />)}
        <AddCard label="Thêm học phần" onClick={onAddModule} />
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { deleteDeck(deck.id); toast(`Đã xoá bộ “${deck.title}”`); }}
        title="Xoá bộ từ vựng?"
        description={`Bộ “${deck.title}” cùng ${modules.length} học phần bên trong sẽ bị xoá. Không thể hoàn tác.`}
        confirmLabel="Xoá bộ từ"
        danger
      />
    </section>
  );
}

function ModuleCard({ mod, tag, onRename }: { mod: Module; tag: string; onRename: () => void }) {
  const { resetModule, deleteModule } = useDemoStore();
  const { toast, comingSoon } = useToast();
  const [confirm, setConfirm] = useState<null | "reset" | "delete">(null);
  const [viewing, setViewing] = useState(false);
  const done = mod.total > 0 && mod.learned >= mod.total;

  const items = [
    { label: "Xem từ", icon: Eye, onSelect: () => setViewing(true) },
    { label: "Đổi tên", icon: Pencil, onSelect: onRename },
    { label: "Đặt lại tiến độ", icon: RotateCcw, onSelect: () => setConfirm("reset") },
    { label: "Xoá học phần", icon: Trash2, onSelect: () => setConfirm("delete"), danger: true },
  ];

  return (
    <article className={`card card-hover flex flex-col p-5 ${done ? "border-[#a7e3c8] bg-[linear-gradient(180deg,#f2fbf7,#fff)]" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="badge badge-primary max-w-[80%] truncate px-3 py-1 text-[13px]">{tag}</span>
        <Menu
          label={`Tuỳ chọn ${mod.title}`}
          items={items}
          trigger={({ open, toggle }) => (
            <button type="button" className="icon-btn -mr-2 -mt-1 size-8 text-ink-soft" aria-label={`Tuỳ chọn học phần ${mod.title}`} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
              <Ellipsis className="size-5" />
            </button>
          )}
        />
      </div>
      <h4 className="mt-3 text-xl font-semibold text-ink">{mod.title}</h4>
      <p className={`mt-1 font-semibold tabular-nums ${done ? "text-success" : mod.learned ? "text-primary" : "text-muted"}`}>
        {mod.learned}/{mod.total}
      </p>
      <div className="mt-5 grid grid-cols-[1fr_1.15fr] gap-2">
        <Menu
          label="Quản lý"
          align="left"
          items={items}
          trigger={({ open, toggle }) => (
            <button type="button" className="btn btn-outline btn-sm w-full" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
              <List className="size-4" /> Quản lý <ChevronDown className="size-3.5" />
            </button>
          )}
        />
        <button
          type="button"
          className={`btn btn-sm ${done ? "btn-success" : "btn-primary"}`}
          disabled={mod.total === 0}
          title={mod.total === 0 ? "Học phần chưa có từ" : undefined}
          onClick={() => comingSoon("Flashcard")}
        >
          <ChevronRight className="size-4" /> Vào học
        </button>
      </div>
      {mod.total === 0 && <p className="mt-2 text-[13px] text-muted">Chưa có từ — lưu từ khi luyện tập để thêm vào đây.</p>}

      <WordListDialog open={viewing} onClose={() => setViewing(false)} title={`${tag} · ${mod.title}`} count={mod.total} />
      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === "reset") { resetModule(mod.id); toast("Đã đặt lại tiến độ học phần"); }
          else { deleteModule(mod.id); toast(`Đã xoá học phần “${mod.title}”`); }
        }}
        title={confirm === "reset" ? "Đặt lại tiến độ?" : "Xoá học phần?"}
        description={confirm === "reset" ? `Toàn bộ ${mod.learned} từ đã học trong “${mod.title}” sẽ trở về trạng thái mới.` : `Học phần “${mod.title}” và ${mod.total} từ bên trong sẽ bị xoá.`}
        confirmLabel={confirm === "reset" ? "Đặt lại" : "Xoá"}
        danger
      />
    </article>
  );
}

function AddCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-line bg-white/50 text-muted transition hover:border-primary/40 hover:bg-primary-tint hover:text-primary"
    >
      <Plus className="size-8 transition group-hover:rotate-90" strokeWidth={1.5} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function SavedSourceGrid({ source }: { source: "test" | "listening" | "reading" | "writing" }) {
  const items = SAVED_BY_SOURCE[source] ?? [];
  const [viewing, setViewing] = useState<string | null>(null);
  const { comingSoon } = useToast();
  if (items.length === 0) {
    return (
      <EmptyState
        icon={PenTool}
        title="Chưa lưu từ nào từ phần Viết"
        description="Khi luyện viết, bấm “Thêm vào bộ từ” ở từ gợi ý để lưu lại và ôn bằng flashcard."
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((it) => {
        const done = it.learned >= it.total;
        return (
          <article key={it.id} className={`card card-hover flex animate-fade-up flex-col p-5 ${done ? "border-[#a7e3c8]" : ""}`}>
            <span className="badge badge-primary w-fit px-3 py-1 text-[13px]">{it.tag}</span>
            <h4 className="mt-3 text-lg font-semibold text-ink">{it.title}</h4>
            <p className={`mt-1 font-semibold ${done ? "text-success" : "text-primary"}`}>{it.learned}/{it.total}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewing(it.title)}><Eye className="size-4" /> Xem từ</button>
              <button type="button" className={`btn btn-sm ${done ? "btn-success" : "btn-primary"}`} onClick={() => comingSoon("Flashcard")}>Vào học</button>
            </div>
          </article>
        );
      })}
      <WordListDialog open={!!viewing} onClose={() => setViewing(null)} title={viewing ?? ""} />
    </div>
  );
}

function NameDialog({ form, onClose, onSubmit }: { form: FormState; onClose: () => void; onSubmit: (title: string) => void }) {
  const isDeck = form?.kind === "deck";
  const editing = !!form?.id;
  const title = `${editing ? "Đổi tên" : "Tạo"} ${isDeck ? "bộ từ vựng" : "học phần"}`;
  return (
    <Dialog open={!!form} onClose={onClose} title={title} description={isDeck ? "Bộ từ riêng tư, chứa nhiều học phần." : "Học phần là một nhóm từ nhỏ để học trong một phiên."} size="sm">
      {form && <NameForm key={form.id ?? form.kind} initial={form.initial ?? ""} placeholder={isDeck ? "VD: Từ khó Part 7" : "VD: Test 1 – Part 5"} onCancel={onClose} onSubmit={onSubmit} submitLabel={editing ? "Lưu" : "Tạo"} />}
    </Dialog>
  );
}

function NameForm({ initial, placeholder, onCancel, onSubmit, submitLabel }: { initial: string; placeholder: string; onCancel: () => void; onSubmit: (t: string) => void; submitLabel: string }) {
  const [v, setV] = useState(initial);
  const [touched, setTouched] = useState(false);
  const trimmed = v.trim();
  const err = !trimmed ? "Vui lòng nhập tên" : trimmed.length > 60 ? "Tối đa 60 ký tự" : null;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setTouched(true); if (!err) onSubmit(trimmed); }} className="space-y-4 pb-2">
      <div>
        <label htmlFor="name-input" className="label">Tên</label>
        <input id="name-input" className="input" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && !!err} />
        <div className="mt-1 flex justify-between text-[13px]">
          <span className="text-danger">{touched && err}</span>
          <span className="text-muted tabular-nums">{trimmed.length}/60</span>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Huỷ</button>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
