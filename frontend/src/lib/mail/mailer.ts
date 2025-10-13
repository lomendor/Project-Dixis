import { put as devPut } from '@/lib/dev/mailbox';

export type Mail = { to: string; subject: string; html?: string; text?: string };

export async function sendMailSafe(msg: Mail): Promise<void> {
  // Non-production: write to dev mailbox instead of SMTP
  if (process.env.DIXIS_ENV !== 'production') {
    devPut({ ...msg, date: new Date().toISOString() });
    if (process.env.NODE_ENV !== 'test') {
      console.log('[mail] dev-mailbox to=%s subject=%s', msg.to, msg.subject);
    }
    return;
  }

  // Production: TODO implement real SMTP when configured
  if (process.env.NODE_ENV !== 'test') {
    console.log('[mail] noop to=%s subject=%s', msg.to, msg.subject);
  }
}
