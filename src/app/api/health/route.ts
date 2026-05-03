import { sql } from "drizzle-orm";
import { isDatabaseConfigured, requireDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isDatabaseConfigured) {
      return Response.json({ ok: false, reason: "DATABASE_URL is required" }, { status: 500 });
    }

    const db = requireDb();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
