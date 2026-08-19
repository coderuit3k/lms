"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export function AvatarUploadButton() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="avatarUploader"
      onClientUploadComplete={() => router.refresh()}
      onUploadError={(error) => alert(`Lỗi tải ảnh: ${error.message}`)}
      appearance={{ container: "items-start" }}
      content={{ button: "Đổi ảnh" }}
    />
  );
}
