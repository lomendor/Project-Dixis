/**
 * AG125: Email Notifications Service
 *
 * Sends transactional emails via Resend API with:
 * - Idempotency support (prevents duplicate sends)
 * - Dry-run mode for CI/dev environments
 * - Graceful error handling (doesn't throw)
 * - Greek-first content
 */

export interface OrderEmailData {
  id: string
  public_token?: string // SECURITY FIX: UUID token for thank-you/tracking links
  total: number
  subtotal: number
  shipping: number
  vat: number
  name: string
  items: Array<{
    titleSnap: string
    qty: number
    priceSnap: number
  }>
}

export interface StatusUpdateEmailData {
  orderId: string
  customerName: string
  newStatus: 'packing' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  trackUrl?: string
}

/**
 * Maps admin UPPERCASE statuses to email-friendly lowercase values.
 * Returns null for statuses that shouldn't trigger customer emails (e.g. PENDING, PAID).
 */
export function normalizeOrderStatus(status: string): StatusUpdateEmailData['newStatus'] | null {
  const map: Record<string, StatusUpdateEmailData['newStatus']> = {
    PACKING: 'packing',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  }
  return map[status.toUpperCase()] ?? null
}

export interface EmailResult {
  ok: boolean
  dryRun?: boolean
  error?: string
  messageId?: string
}

/**
 * Send order confirmation email
 *
 * @param order - Order data to include in email
 * @param toEmail - Recipient email address
 * @returns Result object (never throws)
 */
export async function sendOrderConfirmation({
  order,
  toEmail
}: {
  order: OrderEmailData
  toEmail: string
}): Promise<EmailResult> {

  // Dry-run mode (CI/dev) - logs but doesn't send
  if (process.env.EMAIL_DRY_RUN === 'true') {
    console.log(`[EMAIL DRY-RUN] Would send order confirmation for order ${order.id}`)
    return { ok: true, dryRun: true }
  }

  // Validate API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[EMAIL] RESEND_API_KEY not configured')
    return { ok: false, error: 'API key missing' }
  }

  // Email config
  const from = process.env.MAIL_FROM || 'Dixis <no-reply@dixis.gr>'
  const replyTo = process.env.MAIL_REPLY_TO || 'support@dixis.gr'

  try {
    const html = renderOrderConfirmationHTML(order)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-${order.id}-confirm-v1` // Prevents duplicate sends
      },
      body: JSON.stringify({
        from,
        to: toEmail,
        reply_to: replyTo,
        subject: `Η παραγγελία σας #${order.id} στο Dixis`,
        html
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[EMAIL] Resend API error ${response.status}:`, errorBody)
      return { ok: false, error: `HTTP ${response.status}` }
    }

    const result = await response.json()
    console.log(`[EMAIL] Sent confirmation for order ${order.id}`, { messageId: result.id })
    return { ok: true, messageId: result.id }

  } catch (error) {
    console.error('[EMAIL] Send failed:', error)
    return { ok: false, error: String(error) }
  }
}

/**
 * Send order status update email
 *
 * @param data - Status update data
 * @param toEmail - Recipient email address
 * @returns Result object (never throws)
 */
export async function sendOrderStatusUpdate({
  data,
  toEmail
}: {
  data: StatusUpdateEmailData
  toEmail: string
}): Promise<EmailResult> {

  // Dry-run mode (CI/dev) - logs but doesn't send
  if (process.env.EMAIL_DRY_RUN === 'true') {
    console.log(`[EMAIL DRY-RUN] Would send status update for order ${data.orderId} -> ${data.newStatus}`)
    return { ok: true, dryRun: true }
  }

  // Validate API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[EMAIL] RESEND_API_KEY not configured')
    return { ok: false, error: 'API key missing' }
  }

  // Email config
  const from = process.env.MAIL_FROM || 'Dixis <no-reply@dixis.gr>'
  const replyTo = process.env.MAIL_REPLY_TO || 'support@dixis.gr'

  const statusLabels: Record<string, string> = {
    packing: 'Σε Συσκευασία',
    processing: 'Σε Επεξεργασία',
    shipped: 'Απεσταλμένη',
    delivered: 'Παραδομένη',
    cancelled: 'Ακυρωμένη',
  }

  try {
    const html = renderStatusUpdateHTML(data, statusLabels[data.newStatus])

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-${data.orderId}-status-${data.newStatus}-v2`
      },
      body: JSON.stringify({
        from,
        to: toEmail,
        reply_to: replyTo,
        subject: `Ενημέρωση παραγγελίας #${data.orderId} - ${statusLabels[data.newStatus]}`,
        html
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[EMAIL] Resend API error ${response.status}:`, errorBody)
      return { ok: false, error: `HTTP ${response.status}` }
    }

    const result = await response.json()
    console.log(`[EMAIL] Sent status update for order ${data.orderId} -> ${data.newStatus}`, { messageId: result.id })
    return { ok: true, messageId: result.id }

  } catch (error) {
    console.error('[EMAIL] Send failed:', error)
    return { ok: false, error: String(error) }
  }
}

/**
 * Render status update email HTML
 */
function renderStatusUpdateHTML(data: StatusUpdateEmailData, statusLabel: string): string {
  const fmt = (amount: number) => `€${amount.toFixed(2)}`

  const statusMessages: Record<string, string> = {
    packing: 'Η παραγγελία σας ετοιμάζεται για αποστολή.',
    processing: 'Η παραγγελία σας ετοιμάζεται από τον παραγωγό.',
    shipped: 'Η παραγγελία σας έχει αποσταλεί και είναι καθ\' οδόν!',
    delivered: 'Η παραγγελία σας έχει παραδοθεί. Ευχαριστούμε!',
    cancelled: 'Η παραγγελία σας έχει ακυρωθεί.',
  }

  const headerColor = data.newStatus === 'cancelled' ? '#dc2626' : '#3b82f6'

  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ενημέρωση Παραγγελίας</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Header -->
  <div style="background-color: ${headerColor}; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">
      Ενημέρωση Παραγγελίας
    </h1>
  </div>

  <!-- Main Content -->
  <div style="background-color: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

    <p style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">
      Γεια σας <strong>${data.customerName}</strong>,
    </p>

    <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151;">
      ${statusMessages[data.newStatus]}
    </p>

    <!-- Status Badge -->
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; padding: 12px 24px; background-color: #dbeafe; color: #1d4ed8; font-size: 18px; font-weight: bold; border-radius: 8px;">
        ${statusLabel}
      </span>
    </div>

    <!-- Order Summary -->
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        Αριθμός Παραγγελίας:
      </p>
      <p style="margin: 0; font-size: 18px; color: #111827; font-weight: bold;">
        #${data.orderId}
      </p>
      <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
        Σύνολο: <strong style="color: #059669;">${fmt(data.total)}</strong>
      </p>
    </div>

    ${data.trackUrl ? `
    <!-- Tracking Link -->
    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.trackUrl}" style="display: inline-block; padding: 12px 28px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Παρακολούθηση Παραγγελίας
      </a>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
        Για οποιαδήποτε απορία, απαντήστε σε αυτό το email ή επικοινωνήστε μαζί μας.
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        Ευχαριστούμε,<br>
        <strong style="color: #374151;">Η ομάδα του Dixis</strong>
      </p>
    </div>

  </div>

</body>
</html>
  `.trim()
}

/**
 * Render order confirmation email HTML
 * Greek-first, responsive design
 */
function renderOrderConfirmationHTML(order: OrderEmailData): string {
  const fmt = (amount: number) => `€${amount.toFixed(2)}`

  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Επιβεβαίωση Παραγγελίας</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Header -->
  <div style="background-color: #059669; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">
      Ευχαριστούμε για την παραγγελία σας!
    </h1>
  </div>

  <!-- Main Content -->
  <div style="background-color: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

    <p style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">
      Γεια σας <strong>${order.name}</strong>,
    </p>

    <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151;">
      Λάβαμε την παραγγελία σας με αριθμό: <strong style="color: #059669;">#${order.id}</strong>
    </p>

    <!-- Order Items -->
    <h2 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 18px; color: #111827;">
      Στοιχεία Παραγγελίας
    </h2>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tbody>
        ${order.items.map(item => `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; color: #374151; font-size: 14px;">
              ${item.titleSnap} <span style="color: #6b7280;">x ${item.qty}</span>
            </td>
            <td style="text-align: right; padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
              ${fmt(item.priceSnap * item.qty)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <table style="width: 100%; margin-top: 20px; font-size: 14px;">
      <tbody>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Υποσύνολο:</td>
          <td style="text-align: right; padding: 8px 0; color: #374151; font-weight: 500;">${fmt(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Αποστολή:</td>
          <td style="text-align: right; padding: 8px 0; color: #374151; font-weight: 500;">${fmt(order.shipping)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">ΦΠΑ (24%):</td>
          <td style="text-align: right; padding: 8px 0; color: #374151; font-weight: 500;">${fmt(order.vat)}</td>
        </tr>
        <tr style="border-top: 2px solid #059669;">
          <td style="padding: 15px 0 0 0; color: #111827; font-size: 18px; font-weight: bold;">Σύνολο:</td>
          <td style="text-align: right; padding: 15px 0 0 0; color: #059669; font-size: 18px; font-weight: bold;">
            ${fmt(order.total)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Call to Action -->
    <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">
        Μπορείτε να δείτε τα στοιχεία της παραγγελίας σας στο:
      </p>
      <p style="margin: 0;">
        <a href="https://dixis.gr/thank-you?token=${order.public_token || order.id}"
           style="color: #059669; text-decoration: none; font-weight: bold; font-size: 14px;">
          https://dixis.gr/thank-you?token=${order.public_token || order.id}
        </a>
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
        Για οποιαδήποτε απορία, απαντήστε σε αυτό το email ή επικοινωνήστε μαζί μας.
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        Ευχαριστούμε,<br>
        <strong style="color: #374151;">Η ομάδα του Dixis</strong>
      </p>
    </div>

  </div>

  <!-- Legal Footer -->
  <div style="text-align: center; margin-top: 20px; padding: 0 20px;">
    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
      Αυτό το email στάλθηκε από το Dixis διότι δημιουργήσατε μια παραγγελία στην πλατφόρμα μας.
    </p>
  </div>

</body>
</html>
  `.trim()
}

/**
 * Send OTP code via email (for admin authentication)
 *
 * @param toEmail - Recipient email address
 * @param code - The 6-digit OTP code
 * @param phone - Phone number (for display in email)
 * @returns Result object (never throws)
 */
export async function sendOtpEmail({
  toEmail,
  code,
  phone
}: {
  toEmail: string
  code: string
  phone: string
}): Promise<EmailResult> {

  // Dry-run mode (CI/dev) - logs but doesn't send
  if (process.env.EMAIL_DRY_RUN === 'true') {
    console.log('[EMAIL DRY-RUN] Would send OTP email')
    return { ok: true, dryRun: true }
  }

  // Validate API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[EMAIL] RESEND_API_KEY not configured')
    return { ok: false, error: 'API key missing' }
  }

  const from = process.env.MAIL_FROM || 'Dixis <no-reply@dixis.gr>'

  try {
    const html = renderOtpEmailHTML(code, phone)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `otp-${phone}-${code}-v1`
      },
      body: JSON.stringify({
        from,
        to: toEmail,
        subject: `Dixis Admin: Ο κωδικός σας είναι ${code}`,
        html
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[EMAIL] OTP email failed ${response.status}:`, errorBody)
      return { ok: false, error: `HTTP ${response.status}` }
    }

    const result = await response.json()
    console.log('[EMAIL] OTP email sent', { messageId: result.id })
    return { ok: true, messageId: result.id }

  } catch (error) {
    console.error('[EMAIL] OTP send failed:', error)
    return { ok: false, error: String(error) }
  }
}

/**
 * Render OTP email HTML (simple, clean design)
 */
function renderOtpEmailHTML(code: string, phone: string): string {
  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Κωδικός OTP</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">

  <!-- Logo -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #059669; margin: 0; font-size: 28px;">Dixis Admin</h1>
  </div>

  <!-- OTP Box -->
  <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center;">
    <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">
      Ο κωδικός OTP για το <strong>${phone}</strong> είναι:
    </p>
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #059669; background: white; padding: 15px 20px; border-radius: 8px; display: inline-block;">
      ${code}
    </div>
    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0;">
      Ο κωδικός λήγει σε 5 λεπτά.
    </p>
  </div>

  <!-- Warning -->
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px; line-height: 1.5;">
    Αν δεν ζητήσατε εσείς αυτόν τον κωδικό, αγνοήστε αυτό το email.
  </p>

</body>
</html>
  `.trim()
}
