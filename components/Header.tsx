"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setBusy(false);
      router.push("/login");
    }
  }

  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={handleLogout}
        disabled={busy}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-60"
      >
        {busy ? "Logging out…" : "Logout"}
      </button>
    </header>
  );
}
