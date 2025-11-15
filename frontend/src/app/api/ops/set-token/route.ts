import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({ token: "" }));
  if (!token || typeof token !== "string" || token.length < 8) {
    return NextResponse.json({ ok:false, error:"invalid token" }, { status: 400 });
  }
  const res = NextResponse.json({ ok:true });
  res.cookies.set("ops_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60*60,
  });
  return res;
}
