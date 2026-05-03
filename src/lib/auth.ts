import { randomBytes, randomInt } from "crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireDb } from "@/db";
import { users } from "@/db/schema";

export const SESSION_COOKIE = "app_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateCode() {
  return `${randomInt(1000, 9999)}`;
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function setSession(userId: string) {
  const db = requireDb();
  const token = generateSessionToken();
  const sessionExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db
    .update(users)
    .set({ sessionToken: token, sessionExpiresAt, updatedAt: new Date() })
    .where(eq(users.id, userId));

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: sessionExpiresAt,
  });
}

export async function clearSession() {
  const db = requireDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db
      .update(users)
      .set({ sessionToken: null, sessionExpiresAt: null, updatedAt: new Date() })
      .where(eq(users.sessionToken, token));
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentUser() {
  const db = requireDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.sessionToken, token), gt(users.sessionExpiresAt, new Date())))
    .limit(1);

  return user ?? null;
}
