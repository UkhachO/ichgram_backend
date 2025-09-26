import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 465,
  secure: String(SMTP_SECURE) === 'true',
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export async function sendVerificationEmail({ to, link }) {
  const from = `"ichgram" <${SMTP_USER}>`;
  const subject = 'Підтвердження електронної пошти';
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6">
      <h2>Підтвердіть ваш email</h2>
      <p>Щоб активувати акаунт, перейдіть за посиланням:</p>
      <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
      <p>Посилання діє 24 години.</p>
      <hr/>
      <p style="font-size:12px;color:#666">Якщо ви не реєструвалися — проігноруйте цей лист.</p>
    </div>
  `;
  await mailer.sendMail({ from, to, subject, html });
}
