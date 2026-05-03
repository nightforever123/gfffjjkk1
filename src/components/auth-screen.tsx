"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [needVerify, setNeedVerify] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canResend = useMemo(() => timer <= 0, [timer]);

  function startTimer(seconds = 60) {
    setTimer(seconds);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function register() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nickname, password, confirmPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Ошибка регистрации");
      return;
    }

    setNeedVerify(true);
    setMessage(data.message ?? "Код отправлен");
    startTimer(data.resendAfterSeconds ?? 60);
  }

  async function resend() {
    if (!canResend) return;
    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка отправки");
      if (data.retryAfter) startTimer(data.retryAfter);
      return;
    }
    setMessage("Код отправлен повторно");
    startTimer(data.resendAfterSeconds ?? 60);
  }

  async function verify() {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: verifyCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка подтверждения");
      return;
    }
    setMessage("Аккаунт подтверждён, теперь войдите");
    setNeedVerify(false);
    setMode("login");
  }

  async function login() {
    setError(null);
    setMessage(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Ошибка входа");
      return;
    }

    if (data.role === "developer") {
      router.push("/admin");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[28px] border border-violet-300/30 bg-black/30 p-6 shadow-[0_20px_60px_rgba(95,67,180,.45)] backdrop-blur-xl">
      <div className="mb-5 grid grid-cols-2 rounded-xl border border-violet-300/20 bg-black/20 p-1">
        <button
          onClick={() => setMode("login")}
          className={`rounded-lg px-4 py-2 text-sm transition ${mode === "login" ? "bg-violet-500 text-white" : "text-violet-200"}`}
        >
          Вход
        </button>
        <button
          onClick={() => setMode("register")}
          className={`rounded-lg px-4 py-2 text-sm transition ${mode === "register" ? "bg-violet-500 text-white" : "text-violet-200"}`}
        >
          Регистрация
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-violet-300/30 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
        />

        {mode === "register" ? (
          <input
            placeholder="Никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-xl border border-violet-300/30 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
          />
        ) : null}

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-violet-300/30 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
        />

        {mode === "register" ? (
          <input
            type="password"
            placeholder="Подтверждение пароля"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-violet-300/30 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300"
          />
        ) : null}

        {!needVerify ? (
          <button
            onClick={mode === "login" ? login : register}
            className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        ) : (
          <div className="rounded-xl border border-violet-300/30 bg-violet-900/20 p-4">
            <p className="text-sm text-violet-100">Введите 4-значный код из email (действует 5 минут)</p>
            <input
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              maxLength={4}
              placeholder="1234"
              className="mt-2 w-full rounded-xl border border-violet-300/30 bg-black/20 px-4 py-3 text-center text-lg tracking-[0.4em] text-white outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button onClick={verify} className="flex-1 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white">
                Подтвердить
              </button>
              <button
                onClick={resend}
                disabled={!canResend}
                className="rounded-xl border border-violet-300/40 px-4 py-2 text-sm text-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {canResend ? "Отправить повторно" : `Повтор через ${timer}с`}
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
    </div>
  );
}
