"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Mic, Square, Trash2 } from "lucide-react";

/** An ephemeral, local recording. No upload, speech recognition or invented pronunciation score. */
export function SpeakingRecorder({name, onStart}: {name: string; onStart: () => void}) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const objectURL = useRef<string | null>(null);
  const mounted = useRef(true);
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [extension, setExtension] = useState("webm");
  const [error, setError] = useState("");
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (stopTimer.current) clearTimeout(stopTimer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach(track => track.stop());
      if (objectURL.current) URL.revokeObjectURL(objectURL.current);
    };
  }, []);
  const stop = () => {if (recorder.current?.state === "recording") recorder.current.stop();};
  const start = async () => {
    if (pending || recording) return;
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Trình duyệt chưa hỗ trợ thu âm ở trang này. Mở bằng HTTPS hoặc localhost, hoặc dùng ứng dụng ghi âm trên thiết bị.");
      return;
    }
    setPending(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({audio: true});
      if (!mounted.current) {media.getTracks().forEach(track => track.stop()); return;}
      stream.current = media;
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(value => MediaRecorder.isTypeSupported(value));
      const instance = new MediaRecorder(media, type ? {mimeType: type} : undefined);
      const chunks: BlobPart[] = [];
      instance.ondataavailable = event => {if (event.data.size) chunks.push(event.data);};
      instance.onstop = () => {
        if (stopTimer.current) clearTimeout(stopTimer.current);
        media.getTracks().forEach(track => track.stop());
        if (!mounted.current) return;
        if (objectURL.current) URL.revokeObjectURL(objectURL.current);
        const next = URL.createObjectURL(new Blob(chunks, {type: instance.mimeType}));
        objectURL.current = next; setUrl(next); setRecording(false);
        setExtension(instance.mimeType.includes("mp4") ? "m4a" : "webm");
      };
      instance.onerror = () => {
        media.getTracks().forEach(track => track.stop());
        if (mounted.current) {setError("Thu âm bị gián đoạn. Hãy thử lại."); setRecording(false);}
      };
      recorder.current = instance;
      onStart(); instance.start(); setRecording(true);
      stopTimer.current = setTimeout(stop, 180000);
    } catch (cause) {
      stream.current?.getTracks().forEach(track => track.stop());
      if (mounted.current) setError(cause instanceof DOMException && cause.name === "NotAllowedError"
        ? "Chưa được phép dùng micro. Hãy cho phép micro trong trình duyệt để thu âm."
        : "Không mở được micro. Kiểm tra thiết bị và thử lại.");
    } finally {if (mounted.current) setPending(false);}
  };
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={pending} className={`btn ${recording ? "btn-outline" : "btn-primary"}`} onClick={recording ? stop : start}>
        {recording ? <Square className="size-4 fill-current" /> : <Mic className="size-4" />}{pending ? "Đang mở micro…" : recording ? "Dừng thu âm" : "Thu âm bài nói"}
      </button>
      <span role="status" className={`text-sm ${recording ? "text-primary" : "text-muted"}`}>{recording ? "Đang thu · tự dừng sau 3 phút" : "Nghe mẫu trước, sau đó nói lại."}</span>
    </div>
    {error && <p role="alert" className="text-sm text-warning-ink">{error}</p>}
    {url && <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
      <p className="text-sm font-semibold">Bản thu của em · nghe lại để tự so sánh</p>
      <audio controls src={url} className="w-full" aria-label="Nghe bản thu của em" />
      <div className="flex flex-wrap gap-3">
        <a href={url} download={`${name}.${extension}`} className="btn btn-outline btn-sm"><Download className="size-4" /> Tải bản thu</a>
        <button className="btn btn-ghost btn-sm" onClick={() => {if (objectURL.current) URL.revokeObjectURL(objectURL.current); objectURL.current = null; setUrl(null);}}><Trash2 className="size-4" /> Xóa bản thu</button>
      </div>
    </div>}
    <p className="text-xs text-muted">Bản thu ở trong phiên này, không gửi lên máy chủ. Tải xuống trước khi chuyển đoạn, đổi chế độ hoặc đóng trang.</p>
  </div>;
}
