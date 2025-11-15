"use client";
import { useEffect, useState } from "react";

type Status = {
  ok: boolean;
  env?: string;
  uptime_s?: number;
  mem_rss_mb?: number;
  db?: { ok: boolean; latency_ms: number };
  commit?: string | null;
};

export default function OpsPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string>("");
  const [token, setToken] = useState("");

  async function load() {
    setError("");
    setStatus(null);
    try {
      const res = await fetch("/api/ops/proxy-status", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setStatus(j);
    } catch (e:any) {
      setError(e?.message || "Failed");
    }
  }

  async function setTok(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/ops/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToken("");
      await load();
    } catch (e:any) {
      setError(e?.message || "Failed");
    }
  }

  async function clearTok() {
    await fetch("/api/ops/clear-token", { method: "POST" });
    setStatus(null);
    setError("Cleared token; set again to view status.");
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Ops Status</h1>
      <form onSubmit={setTok} className="flex gap-2 mb-4">
        <input value={token} onChange={e=>setToken(e.target.value)} placeholder="OPS token"
               className="border rounded px-3 py-2 w-full" />
        <button className="border rounded px-3 py-2">Set</button>
        <button type="button" onClick={clearTok} className="border rounded px-3 py-2">Clear</button>
      </form>
      <button onClick={load} className="border rounded px-3 py-2 mb-4">Reload</button>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {!status ? <p className="text-neutral-600">No data.</p> : (
        <pre className="bg-neutral-50 border p-3 rounded text-sm overflow-auto">{JSON.stringify(status, null, 2)}</pre>
      )}
      <p className="text-xs text-neutral-500 mt-4">Note: page is <code>noindex,nofollow</code> and requires valid token cookie.</p>
    </main>
  );
}
