"use client";

import { useEffect, useState } from "react";

type AdminNote = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type AdminUser = {
  id: string;
  email: string;
  nickname: string;
  role: "user" | "developer";
  emailVerified: boolean;
  notes: AdminNote[];
};

type AdminData = {
  stats: {
    users: number;
    notes: number;
    verified: number;
    developers: number;
  };
  users: AdminUser[];
};

export function AdminPanel() {
  const [data, setData] = useState<AdminData | null>(null);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Ошибка загрузки панели");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function removeNote(id: string) {
    const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-violet-200">Загрузка admin-данных...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Пользователи" value={data.stats.users} />
        <StatCard label="Заметки" value={data.stats.notes} />
        <StatCard label="Подтверждённые" value={data.stats.verified} />
        <StatCard label="Разработчики" value={data.stats.developers} />
      </div>

      <section className="space-y-3">
        {data.users.map((user) => {
          const opened = openUserId === user.id;
          return (
            <article key={user.id} className="rounded-2xl border border-violet-300/25 bg-black/25 p-4 backdrop-blur-lg">
              <button
                onClick={() => setOpenUserId(opened ? null : user.id)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div>
                  <p className="font-medium text-white">{user.nickname}</p>
                  <p className="text-sm text-violet-200">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-violet-300/30 px-2 py-1 text-violet-100">
                    {user.role === "developer" ? "⚡ Разработчик" : "👤 Пользователь"}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-1 ${
                      user.emailVerified
                        ? "border-emerald-300/30 text-emerald-200"
                        : "border-amber-300/40 text-amber-200"
                    }`}
                  >
                    {user.emailVerified ? "Подтверждён" : "Не подтверждён"}
                  </span>
                </div>
              </button>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => removeUser(user.id)}
                  className="rounded-lg border border-rose-300/40 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/20"
                >
                  Удалить пользователя
                </button>
              </div>

              {opened ? (
                <div className="mt-4 rounded-xl border border-violet-300/20 bg-violet-950/30 p-3">
                  <p className="mb-2 text-sm font-medium text-violet-100">Заметки пользователя ({user.notes.length})</p>
                  <div className="space-y-2">
                    {user.notes.length === 0 ? <p className="text-xs text-violet-200">Нет заметок</p> : null}
                    {user.notes.map((note) => (
                      <div key={note.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-white">{note.title}</p>
                          <button
                            onClick={() => removeNote(note.id)}
                            className="text-xs text-rose-200 hover:text-rose-100"
                          >
                            Удалить
                          </button>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-violet-100/90">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-violet-300/25 bg-black/30 p-4 text-center backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.08em] text-violet-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
