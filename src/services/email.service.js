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
  const subject = 'Подтверждение электронной почты';
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6">
      <h2>Подтвердите ваш email</h2>
      <p>Чтобы активировать аккаунт, перейдите по ссылке:</p>
      <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
      <p>Ссылка действует 24 часа.</p>
      <hr/>
      <p style="font-size:12px;color:#666">Если вы не регистрировались, проигнорируйте это письмо.</p>
    </div>
  `;
  await mailer.sendMail({ from, to, subject, html });
}

export async function sendResetPasswordEmail({ to, link }) {
  const from = `"ichgram" <${SMTP_USER}>`;
  const subject = 'Восстановление пароля';
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6">
      <h2>Восстановление пароля</h2>
      <p>Чтобы изменить пароль, перейдите по ссылке (действует ограниченное время):</p>
      <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
      <hr/>
      <p style="font-size:12px;color:#666">Если это были не вы – проигнорируйте письмо.</p>
    </div>
  `;
  await mailer.sendMail({ from, to, subject, html });
}
