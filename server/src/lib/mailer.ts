import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // If production SMTP is set, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Otherwise, fallback to Ethereal Email for development
  console.warn("No SMTP credentials provided. Creating ethereal test account for development...");
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: '"Cryptid Platform" <noreply@cryptid.local>',
      to,
      subject,
      html,
    });
    
    // For development, log the URL to preview the email
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`✉️ Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
