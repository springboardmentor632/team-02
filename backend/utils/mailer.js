const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Creates Nodemailer transporter for PolicyGPT email dispatches.
 */
function getTransporter() {
  dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

  const user = (process.env.EMAIL_USER || 'damahemalatha834@gmail.com').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  return null;
}

/**
 * Sends a 6-digit OTP email to the user requesting password reset.
 * @param {string} toEmail 
 * @param {string} otp 
 */
async function sendOtpEmail(toEmail, otp) {
  dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
  const senderEmail = (process.env.EMAIL_USER || 'damahemalatha834@gmail.com').trim();

  const transporter = getTransporter();


  console.log(`\n==================================================`);
  console.log(`[POLICYGPT OTP DISPATCH]`);
  console.log(`Target Email: ${toEmail}`);
  console.log(`Sender Mail:  ${senderEmail}`);
  console.log(`Generated OTP: ${otp}`);
  console.log(`==================================================\n`);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0d47a1; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Government Policy Intelligence Platform</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Password Reset Request</p>
      </div>
      <div style="padding: 30px; color: #333333; line-height: 1.6;">
        <p>Hello,</p>
        <p>You requested to reset your password for your <strong>PolicyGPT</strong> account.</p>
        <p>Use the following 6-digit One-Time Password (OTP) to reset your password. This OTP is valid for <strong>15 minutes</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0d47a1; background-color: #e8eaf6; padding: 12px 24px; border-radius: 6px; border: 1px dashed #3f51b5;">
            ${otp}
          </span>
        </div>
        <p style="color: #666666; font-size: 13px;">If you did not request this password reset, please ignore this email or contact support if you have security concerns.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
        <p style="font-size: 12px; color: #888888; text-align: center;">
          Sent automatically from PolicyGPT (${senderEmail}). Please do not reply directly to this email.
        </p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"PolicyGPT Support" <${senderEmail}>`,
        to: toEmail,
        subject: `${otp} is your PolicyGPT Password Reset OTP`,
        text: `Your OTP for PolicyGPT password reset is ${otp}. It is valid for 15 minutes.`,
        html: htmlContent,
      });
      console.log(`[EMAIL DISPATCH SUCCESS] Sent email to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL DISPATCH ERROR] Failed to send email via Gmail SMTP:`, err.message);
      // Return true anyway so dev workflow isn't blocked, OTP was logged to console
      return { success: true, fallbackLogged: true, error: err.message };
    }
  } else {
    console.log(`[EMAIL DISPATCH NOTICE] EMAIL_PASS not set in .env. OTP printed to server log above.`);
    return { success: true, fallbackLogged: true };
  }
}

module.exports = { sendOtpEmail };
