import { Buffer } from 'node:buffer';

export async function sendSMS_viaTwilio(to: string, text: string){
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  const from = process.env.TWILIO_FROM_NUMBER || '';
  const disabled = process.env.DIXIS_SMS_DISABLE === '1';

  if (disabled) return { ok: true, simulated: true };

  if (!sid || !token || !from) throw new Error('Twilio env not configured');
  const body = new URLSearchParams({ To: to, From: from, Body: text });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
    body
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}`);
  const data = await res.json().catch(()=> ({}));
  return { ok: true, sid: data?.sid };
}
