import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { PhoneSchema } from '@/lib/validators/auth';
import { normalizePhone } from '@/lib/auth/phone';

const OTP_TTL = 5 * 60 * 1000; // 5'
const RATE_WINDOW = 60 * 1000; // 60"
const MAX_PER_HOUR = 5;

export async function POST(req: Request){
  try{
    const body = await req.json().catch(():null=>null);
    const parsed = PhoneSchema.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:'Παρακαλώ δώστε έγκυρο τηλέφωνο.'},{status:400});
    const phone = normalizePhone(parsed.data.phone);

    // Rate limit: 1/60" & ≤5/ώρα
    const now = new Date();
    const since1m = new Date(now.getTime()-RATE_WINDOW);
    const since1h = new Date(now.getTime()-60*60*1000);
    const recent = await prisma.otpRequest.findFirst({ where:{ phone, createdAt: { gt: since1m } }});
    if(recent) return NextResponse.json({error:'Προσπαθήστε ξανά σε 1 λεπτό.'},{status:429});
    const countHour = await prisma.otpRequest.count({ where:{ phone, createdAt: { gt: since1h } }});
    if(countHour >= MAX_PER_HOUR) return NextResponse.json({error:'Υπερβήκατε τα όρια. Δοκιμάστε αργότερα.'},{status:429});

    const devBypass = process.env.OTP_BYPASS || '';
    const code = devBypass && process.env.NODE_ENV!=='production' ? devBypass : String(Math.floor(100000 + Math.random()*900000));

    const expiresAt = new Date(now.getTime()+OTP_TTL);
    await prisma.otpRequest.create({ data: { phone, code, expiresAt } });

    // Dev convenience: επιστρέφουμε τον κωδικό όταν υπάρχει OTP_DEV_ECHO=1
    const echo = process.env.OTP_DEV_ECHO === '1' && process.env.NODE_ENV !== 'production';
    return NextResponse.json({ ok:true, phone, devCode: echo ? code : undefined });
  }catch(e){
    return NextResponse.json({error:'Σφάλμα αιτήματος OTP'}, {status:500});
  }
}
