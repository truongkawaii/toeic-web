import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app">
      <section className="card mx-auto flex max-w-xl animate-fade-up flex-col items-center px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-canvas text-[#a3b1c6]">
          <SearchX className="size-9" strokeWidth={1.5} />
        </span>
        <p className="mt-5 text-sm font-semibold text-primary">404</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Không tìm thấy trang</h1>
        <p className="mt-2 max-w-sm text-muted">Đường dẫn có thể đã thay đổi hoặc không tồn tại.</p>
        <Link href="/" className="btn btn-primary mt-6">Về Tổng quan</Link>
      </section>
    </div>
  );
}
