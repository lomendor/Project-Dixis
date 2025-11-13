import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

export async function GET(req: Request){
  try{
    const url = new URL(req.url);
    const to = (url.searchParams.get('to') || process.env.ADMIN_EMAIL || '').trim();
    if(!to) return NextResponse.json({ ok:false, error:'no-to' }, { status: 400 });
    const r = await sendMail({ to, subject: 'Dixis SMTP test', text: 'Hello from Dixis SMTP test.' });
    return NextResponse.json({ ok:true, id: r.messageId }, { status: 200 });
  }catch(err:any){
    return NextResponse.json({ ok:false, error: err?.message || 'mail-error' }, { status: 500 });
  }
}
