import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthScreen } from "@/components/auth-screen";
import {
  DEFAULT_DEVELOPER_EMAIL,
  DEFAULT_DEVELOPER_PASSWORD,
  ensureDeveloperAccount,
} from "@/lib/developer";
import { isDatabaseConfigured } from "@/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isDatabaseConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-3xl border border-amber-400/30 bg-amber-900/20 p-8 text-amber-100 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold">Требуется DATABASE_URL</h1>
          <p className="mt-3 text-sm text-amber-200/90">
            Для сборки на Netlify добавьте переменную окружения DATABASE_URL в настройках сайта.
          </p>
        </section>
      </main>
    );
  }

  await ensureDeveloperAccount();

  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "developer" ? "/admin" : "/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="mb-8 rounded-3xl border border-violet-300/30 bg-black/25 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.08em] text-violet-300">Secure Notes</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Авторизация + заметки + admin панель</h1>
        <p className="mt-2 text-sm text-violet-100/90">
          Регистрация с email-кодом (4 цифры), красивый тёмный интерфейс и role-based доступ.
        </p>
        <div className="mt-4 rounded-xl border border-violet-300/30 bg-violet-950/25 p-4 text-xs text-violet-100">
          <p>Developer аккаунт создан автоматически:</p>
          <p className="mt-1">Email: {DEFAULT_DEVELOPER_EMAIL}</p>
          <p>Пароль: {DEFAULT_DEVELOPER_PASSWORD}</p>
          <p className="mt-1 opacity-80">(рекомендуется изменить через env: DEV_EMAIL / DEV_PASSWORD)</p>
          <Link href="/admin" className="mt-2 inline-block text-violet-300 underline">
            Перейти в панель разработчика
          </Link>
        </div>
      </div>

      <AuthScreen />
    </main>
  );
}
