import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";
import { canManageCourses } from "@/lib/instructor";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const appUser = await getCurrentAppUser();
  if (!appUser) redirect("/sign-in");
  if (!canManageCourses(appUser)) redirect("/dashboard");

  return <>{children}</>;
}
