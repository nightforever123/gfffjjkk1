import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const current = await getCurrentUser();
    if (!current || current.role !== "developer") {
      return Response.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;

    if (current.id === id) {
      return Response.json({ error: "Нельзя удалить самого себя" }, { status: 400 });
    }

    const db = requireDb();
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });

    if (!deleted) {
      return Response.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка удаления пользователя" }, { status: 500 });
  }
}
