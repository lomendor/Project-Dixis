import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";

const Schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
  hp: z.string().optional(), // honeypot
});

// Rate limiting
const BUCKET = new Map<string, { c: number; t: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQ = 10;

function allow(ip: string) {
  const now = Date.now();
  const k = ip || "unknown";
  const v = BUCKET.get(k) ?? { c: 0, t: now };
  if (now - v.t > WINDOW_MS) {
    v.c = 0;
    v.t = now;
  }
  v.c++;
  BUCKET.set(k, v);
  return v.c <= MAX_REQ;
}

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok:false, errors: parsed.error.flatten() }, { status: 422 });

  // honeypot
  if (parsed.data.hp && parsed.data.hp.trim() !== "") return NextResponse.json({ ok:true });

  const to = process.env.ADMIN_EMAIL ?? "info@dixis.gr";
  const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const html = `<p><b>Όνομα:</b> ${esc(parsed.data.name)}</p>
<p><b>Email:</b> ${esc(parsed.data.email)}</p>
<p><b>Μήνυμα:</b><br/>${esc(parsed.data.message).replace(/\n/g,"<br/>")}</p>`;
  const res = await sendMail(to, `Contact form — ${esc(parsed.data.name)}`, html, parsed.data.email);

  // Autoreply (thank you email)
  try {
    await sendMail(
      parsed.data.email,
      "Λάβαμε το μήνυμά σας — Dixis",
      "<p>Σε ευχαριστούμε για την επικοινωνία! Θα απαντήσουμε σύντομα.</p>"
    );
  } catch {}

  return NextResponse.json(res);
}
