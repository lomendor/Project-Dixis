import { prisma } from '@/lib/db/client';
import { renderSMS } from '@/lib/notify/templates';
import { renderEmail } from '@/lib/notify/emailTemplates';
import { sendSMS_viaTwilio } from '@/lib/notify/providers/twilio';
import { sendEmail_viaSendgrid } from '@/lib/notify/providers/sendgrid';

export async function deliverOne(id: string){
  const n = await prisma.notification.findUnique({ where:{ id }});
  if(!n || n.status !== 'QUEUED') return { ok:false, reason:'Not queued' };

  try{
    if(n.channel === 'SMS'){
      const text = renderSMS(n.template, n.payload as any);
      const r = await sendSMS_viaTwilio(n.to, text);
      await prisma.notification.update({ where:{ id:n.id }, data:{ status:'SENT', sentAt: new Date(), error: r.simulated ? 'SIMULATED' : null }});
      return { ok:true, simulated: !!(r as any).simulated };
    }
    if(n.channel === 'EMAIL'){
      const { subject, html } = renderEmail(n.template, n.payload as any);
      const r = await sendEmail_viaSendgrid(n.to, subject, html);
      await prisma.notification.update({ where:{ id:n.id }, data:{ status:'SENT', sentAt: new Date(), error: (r as any).simulated ? 'SIMULATED' : null }});
      return { ok:true, simulated: !!(r as any).simulated };
    }
    await prisma.notification.update({ where:{ id:n.id }, data:{ status:'FAILED', error:'Unknown channel' }});
    return { ok:false, reason:'Unknown channel' };
  }catch(e:any){
    await prisma.notification.update({ where:{ id:n.id }, data:{ status:'FAILED', error: String(e?.message||e) }});
    return { ok:false, reason:'EXCEPTION' };
  }
}

export async function deliverQueued(limit=10){
  const rows = await prisma.notification.findMany({ where:{ status:'QUEUED' }, orderBy:{ createdAt:'asc' }, take: limit });
  const out = [];
  for(const r of rows){ out.push({ id:r.id, ...(await deliverOne(r.id)) }); }
  return out;
}
