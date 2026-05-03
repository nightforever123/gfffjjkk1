import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export const DEFAULT_DEVELOPER_EMAIL = process.env.DEV_EMAIL ?? "developer@site.local";
export const DEFAULT_DEVELOPER_PASSWORD = process.env.DEV_PASSWORD ?? "Dev12345!";
export const DEFAULT_DEVELOPER_NICKNAME = process.env.DEV_NICKNAME ?? "Developer";

export async function ensureDeveloperAccount() {
  const db = requireDb();

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEFAULT_DEVELOPER_EMAIL))
    .limit(1);

  if (existing) {
    if (existing.role !== "developer" || !existing.emailVerified) {
      await db
        .update(users)
        .set({ role: "developer", emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, existing.id));
    }
    return;
  }

  const passwordHash = await hashPassword(DEFAULT_DEVELOPER_PASSWORD);

  await db.insert(users).values({
    email: DEFAULT_DEVELOPER_EMAIL,
    nickname: DEFAULT_DEVELOPER_NICKNAME,
    passwordHash,
    role: "developer",
    emailVerified: true,
  });
}
