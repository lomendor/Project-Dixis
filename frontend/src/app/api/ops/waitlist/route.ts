import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

export async function POST(req: Request){
  try{
    const b = await req.json();
    const required = (v?: string)=> (v||'').toString().trim();
    const name = required(b?.name), phone = required(b?.phone);
    if(!name || !phone) return NextResponse.json({ ok:false, error:'missing-fields' }, { status: 400 });
    const lines = [
      `Όνομα/Επωνυμία: ${name}`,
      `Τηλέφωνο: ${phone}`,
      `Email: ${(b?.email||'-')}`,
      `Περιοχή: ${(b?.region||'-')}`,
      `Προϊόντα: ${(b?.products||'-')}`,
      `Σημειώσεις: ${(b?.notes||'-')}`,
      `Χρόνος: ${new Date(b?.ts||Date.now()).toISOString()}`
    ].join('\n');
    const to = process.env.ADMIN_EMAIL || '';
    if(!to) return NextResponse.json({ ok:false, error:'no-admin' }, { status: 500 });
    await sendMail({ to, subject: 'Dixis — Νέος παραγωγός (waitlist)', text: lines });
    return NextResponse.json({ ok:true }, { status: 200 });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message || 'waitlist-failed' }, { status: 500 });
  }
}
