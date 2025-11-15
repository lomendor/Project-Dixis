import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ops_token")?.value;
  if (!token) return NextResponse.json({ ok:false, error:"no token" }, { status: 401 });

  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/ops/status`, { headers: { "x-ops-token": token }, cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ ok:false, error:`upstream ${res.status}` }, { status: res.status });
  }
  const json = await res.json();
  return NextResponse.json(json);
}
