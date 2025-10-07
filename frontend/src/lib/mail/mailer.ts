import type { Transporter } from 'nodemailer';

type MailInput = { to:string; subject:string; html?:string; text?:string; from?:string };
type MailResult = { ok:boolean; provider:'smtp'|'noop'; id?:string; reason?:string };

function readEnv(){
  return {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE||'false').toLowerCase()==='true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Dixis <no-reply@localhost>',
    devMailbox: String(process.env.SMTP_DEV_MAILBOX||'0')==='1',
  };
}

async function getTransport(): Promise<Transporter | null>{
  const env = readEnv();
  if(!env.host || !env.user || !env.pass){
    return null;
  }
  const nodemailer = await import('nodemailer').then(m=>m.default||m);
  return nodemailer.createTransport({
    host: env.host, port: env.port, secure: env.secure,
    auth: { user: env.user, pass: env.pass }
  });
}

export async function sendMailSafe(input: MailInput): Promise<MailResult>{
  const env = readEnv();
  // Dev mailbox sink (γράφει στο .tmp/last-mail.json για γρήγορο έλεγχο)
  if(env.devMailbox){
    const fs = await import('fs');
    fs.mkdirSync('frontend/.tmp', { recursive:true });
    fs.writeFileSync('frontend/.tmp/last-mail.json', JSON.stringify({ at: new Date().toISOString(), ...input }, null, 2));
  }
  const t = await getTransport();
  if(!t){
    console.warn('[mail] SMTP_* not configured — noop', { to: input.to, subject: input.subject });
    return { ok:false, provider:'noop', reason:'smtp_not_configured' };
  }
  const info = await t.sendMail({ from: input.from || readEnv().from, to: input.to, subject: input.subject, html: input.html, text: input.text });
  return { ok:true, provider:'smtp', id: info.messageId };
}

// Helpers για render
export type OrderLike = {
  id: string; status?: string; total?: number; createdAt?: Date|string;
  buyerName?: string; buyerEmail?: string; buyerPhone?: string;
  shippingLine1?: string; shippingCity?: string; shippingPostal?: string;
  items?: { titleSnap?: string; qty?: number; price?: number }[];
};

export async function renderOrderEmail(kind:'confirm'|'status', order: OrderLike): Promise<{subject:string; html:string; text:string}>{
  if(kind==='confirm'){
    const mod = await import('@/emails/order-confirmation');
    return mod.render(order);
  } else {
    const mod = await import('@/emails/order-status-update');
    return mod.render(order);
  }
}
