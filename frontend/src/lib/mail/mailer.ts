import type { Transporter } from 'nodemailer';

type Mail = { to: string | string[]; subject: string; html: string; text?: string };
let transporter: Transporter | null = null;

// Lazy init to avoid breaking build when SMTP envs are missing
function ensure() {
  if (transporter !== null) return transporter;
  
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!host || !user || !pass) {
    transporter = null as any;
    return null;
  }
  
  // @ts-ignore - dynamic import to avoid bundling
  const nm = require('nodemailer');
  transporter = nm.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  
  return transporter;
}

export async function sendMailSafe(msg: Mail) {
  const from = process.env.SMTP_FROM || 'no-reply@dixis.local';
  
  try {
    const t = ensure();
    
    if (!t) {
      console.log('[mail] skipped (missing SMTP envs)', msg.subject);
      return { skipped: true };
    }
    
    const info = await t.sendMail({ from, ...msg });
    console.log('[mail] sent', info.messageId);
    return { ok: true };
  } catch (e) {
    console.warn('[mail] error', (e as Error).message);
    return { ok: false, error: String((e as Error).message) };
  }
}
