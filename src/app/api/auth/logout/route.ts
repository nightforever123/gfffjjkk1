import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка выхода" }, { status: 500 });
  }
}
