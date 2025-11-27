/**
 * Server-side mailer
 * Uses SMTP_* env vars (consistent with lib/mail.ts)
 */
import nodemailer from 'nodemailer';

export function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? '587');
  const secure = String(process.env.SMTP_SECURE ?? 'false') === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Mailer] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)');
    return null;
  }

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendMail(opts: { to: string; subject: string; text?: string; html?: string }) {
  const transport = makeTransport();
  if (!transport) {
    console.warn('[Mailer] Skipping email - SMTP not configured');
    return { ok: false, reason: 'smtp-not-configured' };
  }

  const from = process.env.MAIL_FROM || `Dixis <no-reply@dixis.gr>`;

  try {
    const result = await transport.sendMail({ from, ...opts });
    return { ok: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Mailer] Send failed:', error);
    return { ok: false, error: String(error) };
  }
}
