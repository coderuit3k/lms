"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";

export function AvatarUploadButton() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="avatarUploader"
      onClientUploadComplete={() => {
        toast.success("Đã cập nhật ảnh đại diện.");
        router.refresh();
      }}
      onUploadError={(error) => {
        toast.error(`Lỗi tải ảnh: ${error.message}`);
      }}
      appearance={{ container: "items-start" }}
      content={{ button: "Đổi ảnh" }}
    />
  );
}
