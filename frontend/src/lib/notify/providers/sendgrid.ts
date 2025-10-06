export async function sendEmail_viaSendgrid(to: string, subject: string, html: string){
  const key = process.env.SENDGRID_API_KEY || '';
  const from = process.env.SENDGRID_FROM || '';
  const disabled = process.env.DIXIS_EMAIL_DISABLE === '1';

  if (disabled) return { ok: true, simulated: true };

  if (!key || !from) throw new Error('SendGrid env not configured');
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject,
    content: [{ type: 'text/html', value: html }]
  };
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`SendGrid ${res.status}`);
  return { ok: true };
}
