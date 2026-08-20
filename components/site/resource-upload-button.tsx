"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export function ResourceUploadButton() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="resourceUploader"
      onClientUploadComplete={() => router.refresh()}
      onUploadError={(error) => alert(`Lỗi tải lên: ${error.message}`)}
      content={{
        button: "Chọn tài liệu để tải lên",
        allowedContent: "Kéo thả file vào đây hoặc bấm để chọn",
      }}
    />
  );
}
