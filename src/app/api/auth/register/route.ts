import { and, eq, or } from "drizzle-orm";
import { requireDb } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { generateCode, hashPassword } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const nickname = String(body.nickname ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!email || !nickname || !password || !confirmPassword) {
      return Response.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return Response.json({ error: "Некорректный email" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Пароль минимум 6 символов" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ error: "Пароли не совпадают" }, { status: 400 });
    }

    const db = requireDb();

    const [duplicate] = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.nickname, nickname)))
      .limit(1);

    if (duplicate) {
      return Response.json({ error: "Email или никнейм уже заняты" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const [created] = await db
      .insert(users)
      .values({
        email,
        nickname,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, nickname: users.nickname });

    const code = generateCode();

    await db.insert(verificationCodes).values({
      userId: created.id,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    });

    await sendVerificationCode({ email: created.email, nickname: created.nickname, code });

    return Response.json({
      ok: true,
      email: created.email,
      resendAfterSeconds: 60,
      codeExpiresInSeconds: 300,
      message: "Код подтверждения отправлен на email",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Не удалось зарегистрироваться" }, { status: 500 });
  }
}
