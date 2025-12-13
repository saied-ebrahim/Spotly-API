import nodemailer from "nodemailer";

// Build transporter using either a well-known service or custom SMTP host/port
const transporter = nodemailer.createTransport(
  process.env.EMAIL_SERVICE
    ? {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true" || Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
);

let isVerified = false;
async function verifyTransporter() {
  if (isVerified) return;
  try {
    await transporter.verify();
    isVerified = true;
    if (process.env.NODE_ENV !== "test") {
      console.log("Email transporter verified and ready.");
    }
  } catch (err) {
    console.error("Failed to verify email transporter:", err && err.message ? err.message : err);
    throw err;
  }
}

async function sendEmail(to, subject, html) {
  await verifyTransporter();
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM ,
      to: to,
      subject: subject,
      html: html,
    });
    return info;
  } catch (err) {
    console.error("Error sending email:", err && err.message ? err.message : err);
    throw err;
  }
}

export { sendEmail };
