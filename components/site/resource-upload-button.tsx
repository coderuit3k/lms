"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";

export function ResourceUploadButton() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="resourceUploader"
      onClientUploadComplete={() => {
        toast.success("Đã tải tài liệu lên.");
        router.refresh();
      }}
      onUploadError={(error) => {
        toast.error(`Lỗi tải lên: ${error.message}`);
      }}
      content={{
        button: "Chọn tài liệu để tải lên",
        allowedContent: "Kéo thả file vào đây hoặc bấm để chọn",
      }}
    />
  );
}
