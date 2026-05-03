import { and, desc, eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { generateCode } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Email обязателен" }, { status: 400 });
    }

    const db = requireDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return Response.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const [latestCode] = await db
      .select()
      .from(verificationCodes)
      .where(and(eq(verificationCodes.userId, user.id)))
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (latestCode) {
      const secondsPassed = Math.floor((Date.now() - new Date(latestCode.createdAt).getTime()) / 1000);
      if (secondsPassed < 60) {
        return Response.json(
          { error: "Повторная отправка доступна позже", retryAfter: 60 - secondsPassed },
          { status: 429 },
        );
      }
    }

    const code = generateCode();
    await db.insert(verificationCodes).values({
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    });

    await sendVerificationCode({ email: user.email, nickname: user.nickname, code });

    return Response.json({ ok: true, resendAfterSeconds: 60 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка повторной отправки" }, { status: 500 });
  }
}
