import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const appUser = await getCurrentAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.role !== "admin") redirect("/dashboard");

  return <>{children}</>;
}
