import { eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/config/db";
import { resourcesTable, usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  resourceUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    text: { maxFileSize: "4MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const appUser = await getCurrentAppUser();
      if (!appUser) throw new UploadThingError("Bạn cần đăng nhập để tải tài liệu lên.");
      return { userId: appUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(resourcesTable).values({
        title: file.name,
        fileUrl: file.ufsUrl,
        fileType: file.type,
        uploadedBy: metadata.userId,
      });
    }),

  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const appUser = await getCurrentAppUser();
      if (!appUser) throw new UploadThingError("Bạn cần đăng nhập để đổi ảnh đại diện.");
      return { userId: appUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.update(usersTable).set({ avatarUrl: file.ufsUrl }).where(eq(usersTable.id, metadata.userId));
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
