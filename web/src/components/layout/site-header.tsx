"use client";

import {
  BookA, BookOpenText, CirclePlay, Ellipsis, FileText, Headphones, Info, LayoutDashboard, Menu as MenuIcon,
  MessagesSquare, Mic, PenTool, RotateCcw, Settings, Trophy, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDemoStore } from "@/lib/store";

const NAV = [
  { href: "/listening", label: "Nghe", icon: Headphones },
  { href: "/reading", label: "Đọc", icon: BookOpenText },
  { href: "/speaking", label: "Nói", icon: Mic },
  { href: "/writing", label: "Viết", icon: PenTool },
  { href: "/vocabulary", label: "Từ vựng", icon: BookA },
  { href: "/tests", label: "Đề thi", icon: FileText },
  { href: "/video", label: "Video", icon: CirclePlay },
  { href: "/community", label: "Cộng đồng", icon: MessagesSquare, badge: 6 },
  { href: "/about", label: "About", icon: Info },
];

const MORE = [
  { href: "/leaderboard", label: "Bảng xếp hạng", icon: Trophy },
  { href: "/settings", label: "Cài đặt mục tiêu", icon: Settings },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { resetDemo, profile } = useDemoStore();
  const { toast } = useToast();

  // Đóng menu mobile khi đổi route
  // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ UI với route
  useEffect(() => setMobileOpen(false), [pathname]);

  const moreActive = MORE.some((m) => isActive(pathname, m.href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="container-app flex h-16 items-center gap-2 xl:h-[72px]">
        <Link href="/" className="focus-ring group mr-2 flex shrink-0 items-center gap-2.5 rounded-xl pr-2" aria-label="TOEIC Practice — Trang chủ">
          <span className="relative size-10 overflow-hidden rounded-xl bg-white ring-1 ring-line transition group-hover:ring-primary/40">
            <Image src="/demo/mascot.jpg" alt="" fill sizes="40px" className="scale-[1.35] object-cover object-[50%_40%]" priority />
          </span>
          <span className="hidden text-[15px] font-bold leading-tight tracking-tight text-ink sm:block xl:hidden min-[1440px]:block">
            TOEIC<span className="text-primary"> Practice</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden flex-1 items-center gap-0.5 xl:flex">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring relative flex h-11 items-center gap-1.5 rounded-xl px-3 text-[15px] font-medium transition ${
                  active ? "bg-primary-soft text-primary" : "text-ink-soft hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={1.8} />
                {label}
                {badge && (
                  <span className="absolute -top-0.5 right-0 grid size-5 place-items-center rounded-full bg-danger text-[11px] font-bold text-white ring-2 ring-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
          <Menu
            label="Thêm"
            align="left"
            items={[
              ...MORE.map((m) => ({ label: m.label, icon: m.icon, onSelect: () => router.push(m.href) })),
              { label: "Khôi phục dữ liệu demo", icon: RotateCcw, onSelect: () => setConfirmReset(true), danger: true },
            ]}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={toggle}
                className={`focus-ring flex h-11 items-center gap-1.5 rounded-xl px-3 text-[15px] font-medium transition ${
                  moreActive || open ? "bg-primary-soft text-primary" : "text-ink-soft hover:bg-canvas hover:text-ink"
                }`}
              >
                <Ellipsis className="size-[18px]" /> More
              </button>
            )}
          />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-warning-soft px-3 py-1.5 text-sm font-semibold text-warning-ink md:flex" title="Chuỗi ngày học">
            🔥 {profile.streak}
          </span>
          <button
            type="button"
            className="icon-btn size-11 text-ink-soft xl:hidden"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Điều hướng di động" className="max-h-[calc(100dvh-64px)] animate-pop-in overflow-y-auto border-t border-line bg-white xl:hidden">
          <div className="container-app grid grid-cols-2 gap-2 py-4 sm:grid-cols-3">
            {[{ href: "/", label: "Tổng quan", icon: LayoutDashboard }, ...NAV, ...MORE].map(({ href, label, icon: Icon, ...rest }) => {
              const active = isActive(pathname, href);
              const badge = "badge" in rest ? (rest.badge as number) : undefined;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-[15px] font-medium ${
                    active ? "border-primary/30 bg-primary-soft text-primary" : "border-line text-ink-soft"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.8} /> {label}
                  {badge && <span className="ml-auto rounded-full bg-danger px-1.5 text-xs font-bold text-white">{badge}</span>}
                </Link>
              );
            })}
            <button type="button" onClick={() => setConfirmReset(true)} className="focus-ring col-span-full flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-medium text-muted">
              <RotateCcw className="size-4" /> Khôi phục dữ liệu demo
            </button>
          </div>
        </nav>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => { resetDemo(); toast("Đã khôi phục dữ liệu demo"); }}
        title="Khôi phục dữ liệu demo?"
        description="Mục tiêu, tiến độ và các bộ từ bạn đã tạo trên trình duyệt này sẽ trở về trạng thái ban đầu."
        confirmLabel="Khôi phục"
        danger
      />
    </header>
  );
}
