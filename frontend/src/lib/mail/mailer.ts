export type Mail = { to: string; subject: string; html?: string; text?: string };

export async function sendMailSafe(msg: Mail): Promise<void> {
  if (String(process.env.SMTP_DEV_MAILBOX || '') === '1') {
    const { put } = await import('./devMailbox');
    await put({ ...msg, at: Date.now() } as any);
    return;
  }
  if (process.env.NODE_ENV !== 'test') {
    console.log('[mail] noop to=%s subject=%s', msg.to, msg.subject);
  }
}
