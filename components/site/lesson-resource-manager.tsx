"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MaterialIcon } from "@/components/site/material-icon";
import { UploadButton } from "@/lib/uploadthing";
import { deleteLessonResource } from "@/app/instructor/actions";
import type { LessonResourceItem } from "@/lib/queries";

function fileIcon(fileType: string | null) {
  if (!fileType) return "description";
  if (fileType.includes("pdf")) return "picture_as_pdf";
  if (fileType.startsWith("image/")) return "image";
  return "description";
}

export function LessonResourceManager({ lessonId, resources }: { lessonId: number; resources: LessonResourceItem[] }) {
  const router = useRouter();

  async function handleDelete(resourceId: number) {
    try {
      await deleteLessonResource(resourceId, lessonId);
      toast.success("Đã xoá tài liệu.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không xoá được tài liệu.");
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-outline-variant/30 pt-3">
      <div className="flex items-center justify-between">
        <h4 className="font-label-md text-label-md text-on-surface-variant">Tài liệu đính kèm</h4>
        <UploadButton
          endpoint="lessonResourceUploader"
          input={{ lessonId }}
          onClientUploadComplete={() => {
            toast.success("Đã đính kèm tài liệu.");
            router.refresh();
          }}
          onUploadError={(error) => {
            toast.error(`Lỗi tải lên: ${error.message}`);
          }}
          appearance={{
            button:
              "bg-surface-container-high text-on-surface text-xs px-3 py-1.5 h-auto rounded-lg hover:bg-surface-container-highest ut-uploading:bg-surface-container-high",
            allowedContent: "hidden",
            container: "w-auto",
          }}
          content={{ button: "+ Đính kèm tài liệu" }}
        />
      </div>

      {resources.length > 0 && (
        <ul className="flex flex-col gap-1">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-container-high/50 transition-colors group">
              <a
                href={r.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 min-w-0 text-on-surface group-hover:text-primary transition-colors"
              >
                <MaterialIcon name={fileIcon(r.fileType)} className="text-outline shrink-0 text-[18px]" />
                <span className="font-label-sm text-label-sm truncate">{r.title}</span>
              </a>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                aria-label={`Xoá tài liệu ${r.title}`}
                title="Xoá tài liệu"
                className="text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full p-1 transition-colors shrink-0"
              >
                <MaterialIcon name="delete" className="text-[16px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
