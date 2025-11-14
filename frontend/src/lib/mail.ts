import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string, replyTo?: string) {
  if (process.env.CI === "true" && process.env.NODE_ENV !== "production") return { ok: true, id: "ci-skip" }; // avoid real send in CI
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = String(process.env.SMTP_SECURE ?? "true") === "true";
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const from = process.env.MAIL_FROM ?? `Dixis <${process.env.SMTP_USER}>`;

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  const info = await transporter.sendMail({ from, to, subject, html, replyTo });
  return { ok: true, id: info.messageId };
}
