import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { users } from "@/db/schema";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return Response.json({ error: "Email и пароль обязательны" }, { status: 400 });
    }

    const db = requireDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return Response.json({ error: "Неверные данные" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Неверные данные" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return Response.json({ error: "Подтвердите email перед входом" }, { status: 403 });
    }

    await setSession(user.id);

    return Response.json({ ok: true, role: user.role });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
