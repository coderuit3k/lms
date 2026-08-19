import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export type AppUser = typeof usersTable.$inferSelect;

/**
 * DB-backed user lookup (role, avatarUrl, ...). Only call this in Server
 * Components/Route Handlers that actually need role/profile data — for a
 * plain "is this request authenticated" check, use `auth()` from
 * `@clerk/nextjs/server` instead (cheaper, no DB round-trip).
 */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!row || row.status === "banned") return null;
  return row ?? null;
}
