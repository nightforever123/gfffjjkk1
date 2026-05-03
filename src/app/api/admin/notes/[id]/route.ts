import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { notes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const current = await getCurrentUser();
    if (!current || current.role !== "developer") {
      return Response.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;
    const db = requireDb();
    const [deleted] = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id });

    if (!deleted) {
      return Response.json({ error: "Заметка не найдена" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка удаления заметки" }, { status: 500 });
  }
}
