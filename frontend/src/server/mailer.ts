import nodemailer from 'nodemailer';

function required(name: string, v?: string){ if(!v) throw new Error(`Missing env ${name}`); return v; }

export function makeTransport(){
  const host = required('MAIL_HOST', process.env.MAIL_HOST);
  const port = Number(process.env.MAIL_PORT ?? '587');
  const secure = port === 465;
  const user = required('MAIL_USER', process.env.MAIL_USER);
  const pass = required('MAIL_PASS', process.env.MAIL_PASS);
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendMail(opts: { to: string, subject: string, text?: string, html?: string }){
  const from = process.env.MAIL_FROM || `Dixis <no-reply@${(process.env.NEXT_PUBLIC_SITE_URL||'https://dixis.gr').replace(/^https?:\/\//,'')}>`;
  const tx = makeTransport();
  return tx.sendMail({ from, ...opts });
}
