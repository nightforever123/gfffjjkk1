import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { requireDb } from "@/db";
import { users, verificationCodes } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();

    if (!email || !code) {
      return Response.json({ error: "Введите email и код" }, { status: 400 });
    }

    const db = requireDb();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return Response.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const [token] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, user.id),
          eq(verificationCodes.code, code),
          gt(verificationCodes.expiresAt, new Date()),
          isNull(verificationCodes.usedAt),
        ),
      )
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (!token) {
      return Response.json({ error: "Неверный или просроченный код" }, { status: 400 });
    }

    await db
      .update(verificationCodes)
      .set({ usedAt: new Date() })
      .where(eq(verificationCodes.id, token.id));

    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return Response.json({ ok: true, message: "Аккаунт подтверждён" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка подтверждения" }, { status: 500 });
  }
}
