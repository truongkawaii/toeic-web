"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/** Lựa chọn tab/filter lưu trên URL để refresh, back/forward và link sâu giữ trạng thái. */
export function useQueryParam<T extends string>(key: string, fallback: T, allowed?: readonly T[]) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get(key) as T | null;
  const value = raw && (!allowed || allowed.includes(raw)) ? raw : fallback;

  const setValue = useCallback(
    (next: T, extra?: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      if (next === fallback) sp.delete(key);
      else sp.set(key, next);
      if (extra) for (const [k, v] of Object.entries(extra)) { if (v === null) sp.delete(k); else sp.set(k, v); }
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, router, pathname, key, fallback],
  );

  return [value, setValue] as const;
}
