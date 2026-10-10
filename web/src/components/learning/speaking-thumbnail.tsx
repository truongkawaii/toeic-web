"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import type { SpeakingVideo } from "@/lib/speaking";

/** Load the video's own thumbnail directly from YouTube's image CDN. */
export function SpeakingThumbnail({video}: {video: SpeakingVideo}) {
  const [quality, setQuality] = useState<"hqdefault" | "default" | null>("hqdefault");
  return quality ? <Image
    src={`https://i.ytimg.com/vi/${video.videoId}/${quality}.jpg`}
    alt={`Thumbnail video ${video.title}`}
    fill
    unoptimized
    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
    className="object-cover"
    onError={() => setQuality(current => current === "hqdefault" ? "default" : null)}
  /> : <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-sm text-white/70"><ImageOff className="size-6" /> Thumbnail chưa tải được</span>;
}
