"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      if (mode === "login") {
        await signIn(email, password);
        router.push("/");
      } else {
        await signUp(email, password);
        setMsg("Conta criada! Agora faça login.");
        setMode("login");
      }
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao autenticar");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {mode === "login"
            ? "Entre para marcar presença e votar."
            : "Crie sua conta para participar dos estudos."}
        </p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl bg-black/30 ring-1 ring-white/10 px-4 py-3 outline-none"
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl bg-black/30 ring-1 ring-white/10 px-4 py-3 outline-none"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {msg && (
            <div className="rounded-xl bg-black/30 ring-1 ring-white/10 p-3 text-sm text-gray-200">
              {msg}
            </div>
          )}

          <button
            className="w-full rounded-xl px-4 py-3 bg-cyan-500/20 ring-1 ring-cyan-300/30 hover:bg-cyan-500/30"
            type="submit"
          >
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          className="mt-4 w-full text-sm text-cyan-300/90 hover:text-cyan-200"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Não tem conta? Criar agora"
            : "Já tem conta? Voltar para entrar"}
        </button>

        <a className="mt-4 block text-center text-sm text-gray-400 hover:text-gray-300" href="/">
          Voltar para início
        </a>
      </div>
    </main>
  );
}
