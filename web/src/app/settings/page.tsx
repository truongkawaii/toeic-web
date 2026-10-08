import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = { title: "Cài đặt" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}
