"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/site/material-icon";
import { createMuxUpload } from "@/app/instructor/actions";

type Status = "idle" | "uploading" | "processing" | "error";

export function VideoUploadButton({ lessonId, hasVideo }: { lessonId: number; hasVideo: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    setStatus("uploading");
    setProgress(0);
    setError(null);

    try {
      const { uploadUrl } = await createMuxUpload(lessonId);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload lỗi (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Lỗi mạng khi tải video lên."));
        xhr.send(file);
      });

      setStatus("processing");
      pollForReady();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Tải video thất bại.");
    }
  }

  function pollForReady() {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 20) clearInterval(interval); // ~2 phút (20 x 6s)
    }, 6000);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading" || status === "processing"}
        className="text-primary hover:text-primary-container disabled:opacity-50 flex items-center gap-1 font-label-sm text-label-sm"
      >
        <MaterialIcon name="upload" className="text-[16px]" />
        {hasVideo ? "Thay video" : "Tải video lên"}
      </button>
      {status === "uploading" && (
        <div className="w-40 h-1.5 bg-outline-variant rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {status === "processing" && (
        <p className="font-label-sm text-label-sm text-on-surface-variant">Mux đang xử lý video, có thể mất vài phút…</p>
      )}
      {status === "error" && <p className="font-label-sm text-label-sm text-error">{error}</p>}
    </div>
  );
}
