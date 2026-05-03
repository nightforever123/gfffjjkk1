"use client";

import { useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type NotesManagerProps = {
  title?: string;
};

export function NotesManager({ title = "Мои заметки" }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState<string | null>(null);

  const isEdit = useMemo(() => Boolean(editing), [editing]);

  async function loadNotes() {
    setLoading(true);
    const res = await fetch("/api/notes", { cache: "no-store" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Не удалось загрузить заметки");
      return;
    }

    setNotes(data.notes ?? []);
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "" });
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setForm({ title: note.title, content: note.content });
    setModalOpen(true);
  }

  async function submit() {
    setError(null);
    const url = isEdit ? `/api/notes/${editing?.id}` : "/api/notes";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка сохранения");
      return;
    }

    setModalOpen(false);
    await loadNotes();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadNotes();
    }
  }

  return (
    <section className="rounded-3xl border border-violet-400/30 bg-black/30 p-5 shadow-[0_20px_60px_rgba(84,44,170,.35)] backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button
          onClick={openCreate}
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
        >
          + Создать
        </button>
      </div>

      {loading ? <p className="text-sm text-violet-200">Загрузка...</p> : null}
      {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((note) => (
          <article
            key={note.id}
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/30 to-black/40 p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-300/50 hover:shadow-[0_15px_35px_rgba(125,80,255,.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-1 text-lg font-medium text-violet-100">{note.title}</h3>
              <span className="text-xs text-violet-300">{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-violet-50/90">{note.content}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openEdit(note)}
                className="rounded-lg border border-violet-300/30 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/20"
              >
                Редактировать
              </button>
              <button
                onClick={() => remove(note.id)}
                className="rounded-lg border border-rose-300/40 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
              >
                Удалить
              </button>
            </div>
          </article>
        ))}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-violet-300/40 bg-[#100d1f]/95 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">{isEdit ? "Редактировать" : "Новая заметка"}</h3>
            <div className="mt-4 space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Заголовок"
                className="w-full rounded-xl border border-violet-300/30 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
              />
              <textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Текст заметки"
                className="w-full rounded-xl border border-violet-300/30 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-violet-300/40 px-4 py-2 text-sm text-violet-100"
              >
                Отмена
              </button>
              <button onClick={submit} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
