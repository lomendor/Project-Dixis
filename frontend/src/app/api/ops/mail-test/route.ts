import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

export async function GET(req: Request){
  // Authorization check via x-ops-key header
  const key = (process.env.OPS_KEY || '').toString();
  const hdr = (req.headers.get('x-ops-key') || '').toString();
  if(!key || hdr !== key){
    return NextResponse.json({ ok:false, error:'unauthorized' }, { status: 401 });
  }

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
