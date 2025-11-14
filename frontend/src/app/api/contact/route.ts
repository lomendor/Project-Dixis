import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";

const Schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
  hp: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok:false, errors: parsed.error.flatten() }, { status: 422 });

  // honeypot
  if (parsed.data.hp && parsed.data.hp.trim() !== "") return NextResponse.json({ ok:true });

  const to = process.env.ADMIN_EMAIL ?? "info@dixis.gr";
  const html = `<p><b>Όνομα:</b> ${parsed.data.name}</p>
<p><b>Email:</b> ${parsed.data.email}</p>
<p><b>Μήνυμα:</b><br/>${parsed.data.message.replace(/\n/g,"<br/>")}</p>`;
  const res = await sendMail(to, `Contact form — ${parsed.data.name}`, html, parsed.data.email);
  return NextResponse.json(res);
}
