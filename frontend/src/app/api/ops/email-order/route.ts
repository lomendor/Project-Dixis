import { NextResponse } from 'next/server';
import { sendMail } from '@/server/mailer';

export async function POST(req: Request){
  try{
    const body = await req.json();
    const to = process.env.ADMIN_EMAIL;
    if(!to) return NextResponse.json({ ok:false, error:'no-admin-email' }, { status: 500 });

    const customer = body?.customer || {};
    const items = Array.isArray(body?.items) ? body.items : [];
    const totals = body?.totals || {};
    const lines = items.map((it:any)=>`• ${it.title} × ${it.qty} — ${(Number(it.price)*Number(it.qty)).toFixed(2)} ${it.currency||'EUR'}`).join('\n');
    const text = `ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ (demo)\n\nΠελάτης: ${customer.name}\nΤηλέφωνο: ${customer.phone}\nEmail: ${customer.email||'-'}\nΔιεύθυνση: ${customer.address}, ${customer.city} ${customer.postcode}\nΣημειώσεις: ${customer.notes||'-'}\n\nΕίδη:\n${lines}\n\nΣύνολο: ${Number(totals.grand||totals.items||0).toFixed(2)} EUR\n`;
    await sendMail({ to, subject: 'Dixis — Νέα παραγγελία (demo)', text });
    return NextResponse.json({ ok:true }, { status: 200 });
  }catch(err:any){
    return NextResponse.json({ ok:false, error: err?.message || 'email-failed' }, { status: 500 });
  }
}
