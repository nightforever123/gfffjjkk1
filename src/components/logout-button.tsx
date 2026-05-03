"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
    >
      Выйти
    </button>
  );
}
