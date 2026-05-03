import { and, eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { notes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!title) {
      return Response.json({ error: "Введите заголовок" }, { status: 400 });
    }

    const db = requireDb();

    const [updated] = await db
      .update(notes)
      .set({ title, content, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
      .returning();

    if (!updated) {
      return Response.json({ error: "Заметка не найдена" }, { status: 404 });
    }

    return Response.json({ ok: true, note: updated });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;
    const db = requireDb();

    const [deleted] = await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
      .returning({ id: notes.id });

    if (!deleted) {
      return Response.json({ error: "Заметка не найдена" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
