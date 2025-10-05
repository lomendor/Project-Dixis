import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { OtpVerifySchema } from '@/lib/validators/auth';
import { normalizePhone } from '@/lib/auth/phone';

export async function POST(req: Request){
  try{
    const body = await req.json().catch(():null=>null);
    const parsed = OtpVerifySchema.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:'Μη έγκυρα στοιχεία.'},{status:400});
    const phone = normalizePhone(parsed.data.phone);
    const code = parsed.data.code;

    const rec = await prisma.otpRequest.findFirst({ where:{ phone }, orderBy:{ createdAt:'desc' }});
    const devBypass = process.env.OTP_BYPASS || '';

    if(!rec) return NextResponse.json({error:'Δεν βρέθηκε ενεργό OTP.'},{status:400});
    const now = new Date();
    if (rec.expiresAt < now) return NextResponse.json({error:'Ο κωδικός έληξε.'},{status:400});
    if (!(rec.code === code || (devBypass && code === devBypass))) {
      await prisma.otpRequest.update({ where:{ id: rec.id }, data:{ attempts: rec.attempts+1 }});
      return NextResponse.json({error:'Λάθος κωδικός.'},{status:400});
    }

    // Δημιουργία session
    const expiresAt = new Date(now.getTime() + 14*24*60*60*1000); // 14 μέρες
    const sess = await prisma.session.create({ data:{ phone, expiresAt } });

    const res = NextResponse.json({ ok:true, phone });
    res.cookies.set('dixis_session', sess.id, {
      httpOnly: true, sameSite: 'lax', path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor((expiresAt.getTime()-now.getTime())/1000)
    });
    return res;
  }catch(e){
    return NextResponse.json({error:'Σφάλμα επιβεβαίωσης OTP'}, {status:500});
  }
}
