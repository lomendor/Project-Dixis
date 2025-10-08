import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { sendMailSafe } from '@/lib/mail/mailer';
import * as NewProducerAdmin from '@/lib/mail/templates/newProducerAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  try{
    const b = await req.json();
    const data = {
      producerName: String(b.producerName||'').trim(),
      companyName: (b.companyName||'') || null,
      afm: (b.afm||'') || null,
      email: String(b.email||'').trim(),
      phone: (b.phone||'') || null,
      categories: (b.categories||'') || null,
      note: (b.note||'') || null,
    };
    if(!data.producerName || !data.email) return NextResponse.json({ error:'INVALID' }, { status:400 });

    const app = await prisma.producerApplication.create({ data });

    // admin notice (best-effort)
    try{
      const to = process.env.DEV_MAIL_TO || '';
      if (to){
        await sendMailSafe({ to, subject: NewProducerAdmin.subject(app.id), text: NewProducerAdmin.text(app) });
      }
    }catch(e){ console.warn('[mail] new producer notice failed'); }

    return NextResponse.json({ ok:true, id: app.id }, { status:201 });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || 'APPLY_FAILED' }, { status:500 });
  }
}
