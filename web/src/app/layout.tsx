import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast";
import { DemoStoreProvider } from "@/lib/store";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "TOEIC Practice — Luyện thi TOEIC mỗi ngày", template: "%s · TOEIC Practice" },
  description:
    "Ứng dụng luyện thi TOEIC cá nhân: theo dõi mục tiêu, luyện Nghe – Đọc – Nói – Viết, học từ vựng theo lặp lại ngắt quãng và luyện đề thi thử.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" className={`${beVietnam.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#main" className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Bỏ qua tới nội dung
        </a>
        <DemoStoreProvider>
          <ToastProvider>
            <SiteHeader />
            <main id="main" className="flex-1 pb-20 pt-6 sm:pt-10">
              {children}
            </main>
            <footer className="border-t border-line bg-white/60 py-6 text-center text-[13px] text-muted">
              TOEIC Practice · Bản demo giao diện — dữ liệu minh hoạ, điểm quy đổi không phải điểm chính thức.
            </footer>
          </ToastProvider>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
