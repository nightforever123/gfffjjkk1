import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPanel } from "@/components/admin-panel";
import { NotesManager } from "@/components/notes-manager";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "developer") {
    redirect("/");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-violet-300/25 bg-black/30 p-5 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-violet-300">⚡ Панель разработчика</p>
          <h1 className="text-2xl font-semibold text-white">Управление пользователями и заметками</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="rounded-xl border border-violet-300/40 px-4 py-2 text-sm text-violet-100">
            Dashboard
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <AdminPanel />
        <NotesManager title="Заметки разработчика" />
      </div>
    </main>
  );
}
