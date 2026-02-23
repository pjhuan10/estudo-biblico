"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
      className="mb-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm transition-all duration-150 ease-out hover:-translate-y-[1px] active:scale-[0.99]"
    >
      ← Voltar
    </button>
  );
}
