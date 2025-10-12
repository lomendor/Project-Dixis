export function companyInfo(){
  return {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Dixis',
    web: process.env.NEXT_PUBLIC_SITE_URL || '',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dixis.local',
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+30 210 0000000'
  }
}

export function baseHtml(title:string, bodyHtml:string){
  const c = companyInfo()
  return `<!doctype html><html lang="el"><meta charset="utf-8"/>
  <body style="margin:0;background:#f6f7f9;font-family:system-ui,Arial,sans-serif;color:#111">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <tr><td style="background:#111;color:#fff;padding:16px 20px;font-size:18px;font-weight:700">${c.name}</td></tr>
          <tr><td style="padding:20px">
            <h2 style="margin:0 0 10px 0;font-size:20px">${title}</h2>
            <div style="font-size:14px;line-height:1.55">${bodyHtml}</div>
          </td></tr>
          <tr><td style="padding:16px 20px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#555">
            Επικοινωνία: <a href="mailto:${c.supportEmail}">${c.supportEmail}</a> · ${c.supportPhone}
            ${c.web ? `· <a href="${c.web}">${c.web}</a>` : ''}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

export function baseText(title:string, lines:string[]){
  const c = companyInfo()
  return [
    title,
    '',
    ...lines,
    '',
    `— ${c.name}`,
    `Επικοινωνία: ${c.supportEmail} · ${c.supportPhone}${c.web?` · ${c.web}`:''}`
  ].join('\n')
}
