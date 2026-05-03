import { desc, eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { notes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const db = requireDb();
    const items = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, user.id))
      .orderBy(desc(notes.updatedAt));

    return Response.json({ notes: items });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка загрузки заметок" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!title) {
      return Response.json({ error: "Введите заголовок" }, { status: 400 });
    }

    const db = requireDb();
    const [created] = await db
      .insert(notes)
      .values({
        userId: user.id,
        title,
        content,
      })
      .returning();

    return Response.json({ ok: true, note: created });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка создания заметки" }, { status: 500 });
  }
}
