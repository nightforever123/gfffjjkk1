import nodemailer from "nodemailer";

type SendVerificationCodeParams = {
  email: string;
  nickname: string;
  code: string;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildTemplate({ nickname, code }: { nickname: string; code: string }) {
  return `
  <div style="background:#070710;padding:32px;font-family:Inter,Arial,sans-serif;color:#ececff;min-height:100%;">
    <div style="max-width:560px;margin:0 auto;border:1px solid rgba(154,116,255,.4);background:rgba(24,22,35,.75);backdrop-filter:blur(8px);border-radius:20px;padding:28px;">
      <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#bba7ff;">Secure verification</p>
      <h1 style="margin:12px 0 16px;font-size:28px;color:#fff;">Привет, ${nickname} 👋</h1>
      <p style="margin:0 0 18px;color:#cbc6e9;font-size:15px;line-height:1.6;">Ваш код подтверждения для входа в аккаунт:</p>
      <div style="font-size:40px;letter-spacing:10px;font-weight:800;color:#9d7cff;background:#121024;border:1px solid #6e49ff;border-radius:14px;padding:16px 18px;text-align:center;">${code}</div>
      <p style="margin:18px 0 0;color:#a89fcb;font-size:13px;line-height:1.6;">Код действует <b style="color:#fff;">5 минут</b>. Если это были не вы — просто проигнорируйте письмо.</p>
    </div>
  </div>`;
}

export async function sendVerificationCode({ email, nickname, code }: SendVerificationCodeParams) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "no-reply@example.com";

  if (!transporter) {
    console.log(`[MAIL_FALLBACK] code for ${email}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from,
    to: email,
    subject: "Ваш код подтверждения",
    html: buildTemplate({ nickname, code }),
  });
}
