import crypto from 'node:crypto';

export function notifFingerprint(channel: string, to: string, template: string, payload: any): string {
  const key = `${channel}|${to}|${template}|${JSON.stringify(payload || {})}`;
  return crypto.createHash('sha256').update(key).digest('hex');
}
