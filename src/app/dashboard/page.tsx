import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NotesManager } from "@/components/notes-manager";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-violet-300/25 bg-black/25 p-5 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-violet-300">Dashboard</p>
          <h1 className="text-2xl font-semibold text-white">Привет, {user.nickname}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "developer" ? (
            <Link href="/admin" className="rounded-xl border border-violet-300/40 px-4 py-2 text-sm text-violet-100">
              Admin
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </header>

      <NotesManager />
    </main>
  );
}
