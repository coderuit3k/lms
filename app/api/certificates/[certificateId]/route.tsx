import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { certificatesTable, coursesTable, usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  const { certificateId: certificateIdParam } = await params;
  const certificateId = Number(certificateIdParam);
  if (!certificateId) return new Response("Not found", { status: 404 });

  const appUser = await getCurrentAppUser();
  if (!appUser) return new Response("Unauthorized", { status: 401 });

  const [row] = await db
    .select({
      id: certificatesTable.id,
      userId: certificatesTable.userId,
      issuedAt: certificatesTable.issuedAt,
      courseTitle: coursesTable.title,
      studentName: usersTable.name,
    })
    .from(certificatesTable)
    .innerJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
    .innerJoin(usersTable, eq(certificatesTable.userId, usersTable.id))
    .where(eq(certificatesTable.id, certificateId));

  if (!row) return new Response("Not found", { status: 404 });
  if (row.userId !== appUser.id) return new Response("Forbidden", { status: 403 });

  const issuedDate = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(row.issuedAt);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)",
          border: "16px solid #1A237E",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#1A237E", letterSpacing: 4, marginBottom: 24 }}>
          SCHOLARIS
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#5C6BC0", marginBottom: 40 }}>
          Chứng chỉ hoàn thành khoá học
        </div>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: "#0D1B4C", marginBottom: 24 }}>
          {row.studentName}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#1A237E", marginBottom: 40, textAlign: "center" }}>
          {row.courseTitle}
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "#5C6BC0" }}>Cấp ngày {issuedDate}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
