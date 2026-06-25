import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 5000,
  tls: { rejectUnauthorized: false },
})

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await transporter.sendMail({
    from: `"Lianata Finance" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Verifikasi Email - Lianata Finance",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#c12a58">Verifikasi Email</h2>
        <p style="color:#334155;line-height:1.6">
          Terima kasih sudah mendaftar di Lianata Finance. 
          Klik tombol di bawah untuk memverifikasi email kamu.
        </p>
        <a href="${url}" 
           style="display:inline-block;padding:12px 24px;background:#c12a58;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">
          Verifikasi Email
        </a>
        <p style="color:#64748b;font-size:13px">
          Atau salin link ini: <br/>
          <span style="color:#c12a58;font-size:12px">${url}</span>
        </p>
        <p style="color:#64748b;font-size:12px;margin-top:24px">
          Link ini akan kedaluwarsa dalam 1 jam.
        </p>
      </div>
    `,
  })
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"Lianata Finance" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Kode Verifikasi - Lianata Finance",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#c12a58">Kode Verifikasi</h2>
        <p style="color:#334155;line-height:1.6">
          Masukkan kode berikut untuk memverifikasi email kamu.
        </p>
        <div style="text-align:center;padding:24px;background:#f8fafc;border-radius:12px;margin:16px 0">
          <span style="font-size:36px;font-weight:700;color:#c12a58;letter-spacing:8px">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px">
          Kode ini berlaku selama 5 menit.
        </p>
        <p style="color:#64748b;font-size:12px;margin-top:24px">
          Jika kamu tidak meminta kode ini, abaikan email ini.
        </p>
      </div>
    `,
  })
}

export async function sendResetPasswordEmail(to: string, url: string): Promise<void> {
  await transporter.sendMail({
    from: `"Lianata Finance" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Atur Ulang Password - Lianata Finance",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#c12a58">Atur Ulang Password</h2>
        <p style="color:#334155;line-height:1.6">
          Kami menerima permintaan untuk mengatur ulang password akun Lianata Finance kamu.
          Klik tombol di bawah untuk melanjutkan.
        </p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#c12a58;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">
          Atur Ulang Password
        </a>
        <p style="color:#64748b;font-size:13px">
          Atau salin link ini: <br/>
          <span style="color:#c12a58;font-size:12px">${url}</span>
        </p>
        <p style="color:#64748b;font-size:12px;margin-top:24px">
          Jika kamu tidak meminta ini, abaikan email ini. Link akan kedaluwarsa dalam 1 jam.
        </p>
      </div>
    `,
  })
}
