"use client";
import { useState } from "react";

export default function ContactPage() {
  const [state,setState] = useState<"idle"|"sending"|"ok"|"error">("idle");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch("/api/contact",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    setState(res.ok ? "ok" : "error");
  };
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Επικοινωνία</h1>
      {state==="ok" && <div className="p-3 rounded bg-green-100">Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα.</div>}
      {state==="error" && <div className="p-3 rounded bg-red-100">Κάτι πήγε στραβά. Δοκίμασε ξανά.</div>}
      <form onSubmit={onSubmit} className="grid gap-3 mt-3">
        <input name="name" placeholder="Ονοματεπώνυμο" required minLength={2} className="border rounded p-2" />
        <input name="email" type="email" placeholder="Email" required className="border rounded p-2" />
        <textarea name="message" placeholder="Μήνυμα" required minLength={10} className="border rounded p-2 h-40" />
        <input name="hp" className="hidden" tabIndex={-1} autoComplete="off" />
        <button disabled={state==="sending"} className="rounded bg-black text-white px-4 py-2">
          {state==="sending" ? "Αποστολή..." : "Αποστολή"}
        </button>
      </form>
    </div>
  );
}
