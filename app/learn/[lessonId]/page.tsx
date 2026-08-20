import { notFound, redirect } from "next/navigation";
import { LearningPlayer } from "@/components/site/learning-player";
import { getCurrentAppUser } from "@/lib/auth";
import { getOwnedCourse } from "@/lib/instructor";
import { getEnrollmentStatus, getLearnPageData } from "@/lib/queries";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId: lessonIdParam } = await params;
  const lessonId = Number(lessonIdParam);
  if (!lessonId) notFound();

  const appUser = await getCurrentAppUser();
  if (!appUser) redirect("/sign-in");

  const data = await getLearnPageData(lessonId, appUser.id);
  if (!data) notFound();

  const enrollmentStatus = await getEnrollmentStatus(appUser.id, data.course.id);
  // Giảng viên sở hữu khoá học (hoặc admin) được tự xem trước bài học của mình, không cần "mua".
  const isOwner = Boolean(await getOwnedCourse(appUser.id, appUser.role === "admin", data.course.id));
  if (enrollmentStatus !== "paid" && !isOwner) redirect(`/courses/${data.course.slug}`);

  return <LearningPlayer data={data} />;
}
