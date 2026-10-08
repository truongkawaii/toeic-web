import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PageSkeleton } from "@/components/layout/page-skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
