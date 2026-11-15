import nodemailer from "nodemailer";

/**
 * Transactional email for Beautifio (password reset).
 *
 * SMTP is the host's Postfix, reachable from the container network at the docker
 * gateway. Two supported modes, both verified on this VPS:
 *   - port 25, NO auth (relay via Postfix `permit_mynetworks`) — preferred
 *   - port 587, STARTTLS + auth when MAIL_NOREPLY_USER/PASS are set
 * Config is read at RUNTIME from env, so changing it needs only a container
 * restart, no rebuild.
 *
 * sendMail() returns false on any failure; callers must fall back gracefully
 * and never leak a reset token.
 */
const SMTP_HOST = process.env.SMTP_HOST || "172.16.1.1";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "25", 10);
const USER = process.env.MAIL_NOREPLY_USER || "";
const PASS = process.env.MAIL_NOREPLY_PASS || "";
const FROM_NAME = process.env.MAIL_FROM_NAME || "Beautifio";
// Sender address is separate from the SMTP login. It must be a domain the
// Postfix on this VPS handles (see `postconf mydestination`).
const FROM_ADDRESS =
  process.env.MAIL_FROM_ADDRESS || USER || "noreply@tukangjajan.com";

let transporter: nodemailer.Transporter | null = null;

export function emailReady(): boolean {
  return !!SMTP_HOST;
}

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    // Only authenticate when credentials are supplied; port 25 relay needs none.
    ...(USER && PASS ? { auth: { user: USER, pass: PASS } } : {}),
    // Internal mail server uses a self-signed certificate.
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return transporter;
}

export interface MailOpts {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(opts: MailOpts): Promise<boolean> {
  if (!emailReady()) return false;
  const t = getTransporter();
  try {
    await t.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (e) {
    console.error("[mail] gagal kirim:", (e as Error).message);
    return false;
  }
}

/** Connection check for /api/health/mail (no message is sent). */
export async function verifyMailTransport(): Promise<{ ok: boolean; error?: string }> {
  if (!emailReady()) return { ok: false, error: "SMTP_HOST is not set" };
  try {
    await getTransporter().verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** HTML template for the password-reset link. */
export function resetPasswordEmailHtml(link: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#084463;color:#ffffff;padding:24px 28px;">
      <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.5px;">BEAUTIFIO</p>
      <h1 style="margin:6px 0 0;font-size:20px;">Atur Ulang Password</h1>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 16px;font-size:14px;color:#1E2938;line-height:1.6;">
        Kami menerima permintaan untuk mengatur ulang password akunmu. Klik tombol di bawah untuk membuat password baru:
      </p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;border-radius:12px;background:#084463;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Atur Password Baru</a>
      <p style="margin:20px 0 0;font-size:12px;color:#647488;line-height:1.6;">
        Tautan ini berlaku 1 jam dan hanya bisa dipakai sekali.<br/>
        Kalau bukan kamu yang meminta, abaikan email ini — passwordmu tidak berubah.
      </p>
    </div>
    <div style="background:#F8FAFC;padding:14px 28px;text-align:center;font-size:11px;color:#647488;">
      Email otomatis dari Beautifio — jangan balas email ini.
    </div>
  </div>
</body>
</html>`;
}
