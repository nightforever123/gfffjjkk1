import { desc, eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { notes, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current || current.role !== "developer") {
      return Response.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const db = requireDb();
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allNotes = await db.select().from(notes).orderBy(desc(notes.updatedAt));

    const notesByUser = new Map<string, typeof allNotes>();
    for (const n of allNotes) {
      const arr = notesByUser.get(n.userId) ?? [];
      arr.push(n);
      notesByUser.set(n.userId, arr);
    }

    const usersWithNotes = allUsers.map((u) => ({
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      notes: notesByUser.get(u.id) ?? [],
    }));

    return Response.json({
      stats: {
        users: allUsers.length,
        notes: allNotes.length,
        verified: allUsers.filter((u) => u.emailVerified).length,
        developers: allUsers.filter((u) => u.role === "developer").length,
      },
      users: usersWithNotes,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка загрузки admin-панели" }, { status: 500 });
  }
}
