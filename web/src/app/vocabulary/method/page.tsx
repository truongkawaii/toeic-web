import { Brain, CalendarClock, Eye, RotateCcw, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Thuật toán học từ" };

const STEPS = [
  { icon: Eye, title: "Gặp từ mới", desc: "Xem từ, IPA, nghĩa và ví dụ. Nghe phát âm nếu có audio." },
  { icon: Brain, title: "Tự kiểm tra", desc: "Lật thẻ và chọn mức nhớ: Quên · Khó · Nhớ · Dễ." },
  { icon: CalendarClock, title: "Lên lịch ôn", desc: "Nhớ càng tốt, khoảng cách tới lần ôn sau càng dài." },
  { icon: Trophy, title: "Thành thạo", desc: "Nhớ đúng liên tiếp ở khoảng ≥ 21 ngày thì từ được tính là thành thạo." },
];

const INTERVALS = ["10 phút", "1 ngày", "3 ngày", "7 ngày", "14 ngày", "21+ ngày"];

export default function MethodPage() {
  return (
    <div className="space-y-6">
      <section className="card animate-fade-up p-6 sm:p-8">
        <span className="badge badge-primary py-1"><Sparkles className="size-3.5" /> Cách hoạt động</span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">Lặp lại ngắt quãng, ôn đúng lúc sắp quên</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
          Mỗi phiên học, hệ thống ưu tiên các từ <b className="text-warning-ink">đến hạn ôn</b>, sau đó lấy thêm <b className="text-primary">từ mới</b> theo
          mục tiêu ngày của bạn. Bản demo dùng quy tắc lịch ôn đơn giản bên dưới — chưa phải thuật toán SRS chuyên sâu.
        </p>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-line-soft bg-canvas/60 p-5">
              <span className="absolute right-4 top-4 text-sm font-bold text-[#c3cfe0]">0{i + 1}</span>
              <span className="grid size-11 place-items-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-line"><s.icon className="size-5" /></span>
              <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card animate-fade-up p-6 sm:p-8 [animation-delay:80ms]">
        <h2 className="text-lg font-semibold text-ink">Khoảng ôn khi bạn chọn “Nhớ”</h2>
        <div className="mt-6 overflow-x-auto pb-2">
          <ol className="flex min-w-[560px] items-center">
            {INTERVALS.map((t, i) => (
              <li key={t} className="flex flex-1 items-center last:flex-none">
                <span className={`grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold ${i === INTERVALS.length - 1 ? "bg-success text-white" : "bg-primary-soft text-primary"}`}>{i + 1}</span>
                <span className="ml-2 whitespace-nowrap text-sm font-medium text-ink-soft">{t}</span>
                {i < INTERVALS.length - 1 && <span aria-hidden className="mx-3 h-0.5 flex-1 rounded bg-gradient-to-r from-primary/40 to-primary/10" />}
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <RotateCcw className="mt-0.5 size-4 shrink-0" /> Chọn “Quên” sẽ đưa từ về bước 1 và xuất hiện lại trong phiên hiện tại.
        </p>
        <Link href="/vocabulary/progress" className="btn btn-primary mt-6">Xem tiến độ của tôi</Link>
      </section>
    </div>
  );
}
