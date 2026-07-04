import nodemailer from 'nodemailer';

// Log and verify SMTP/Brevo environment variables on module import (server boot)
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;

console.log('[SMTP DEPLOYMENT DIAGNOSTICS]');
console.log(`- SMTP_HOST: ${smtpHost !== undefined ? `"${smtpHost}"` : 'UNDEFINED'}`);
console.log(`- SMTP_PORT: ${smtpPort !== undefined ? `"${smtpPort}"` : 'UNDEFINED'}`);
console.log(`- SMTP_USER: ${smtpUser !== undefined ? `"${smtpUser}"` : 'UNDEFINED'}`);
console.log(`- SMTP_PASS: ${process.env.SMTP_PASS !== undefined ? 'PRESENT (HIDDEN)' : 'UNDEFINED'}`);
console.log(`- BREVO_API_KEY: ${process.env.BREVO_API_KEY !== undefined ? 'PRESENT (HIDDEN)' : 'UNDEFINED'}`);

const getFrontendUrl = () => {
  const urlEnv = process.env.FRONTEND_URL;
  let url = 'https://oibsip-2uvp.vercel.app';
  
  if (urlEnv) {
    if (urlEnv.includes(',')) {
      const urls = urlEnv.split(',').map(u => u.trim());
      const nonLocal = urls.find(u => !u.includes('localhost'));
      url = nonLocal || urls[0];
    } else {
      url = urlEnv.trim();
    }
  }
  
  // Strip trailing slashes to prevent double slashes (e.g. //verify-email)
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    const port = parseInt(process.env.SMTP_PORT);
    // secure: true for SSL (port 465), false for STARTTLS (port 587 and others)
    const isSecure = port === 465;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure,
      requireTLS: !isSecure, // Enforce TLS upgrade if not SSL (e.g. port 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000, // 5s connection timeout
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    try {
      await transporter.verify();
      console.log(`[MAIL] Configured and verified SMTP Transporter successfully (${process.env.SMTP_HOST}:${port}).`);
    } catch (verifyErr) {
      console.error(`[MAIL ERROR] SMTP Transporter verification failed: ${verifyErr.message}`);
    }
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        connectionTimeout: 2000, // 2s connection timeout for Ethereal fallback
        greetingTimeout: 2000,
        socketTimeout: 3000,
      });
      console.log(`[MAIL] SMTP environment variables not configured. Created dynamic Ethereal Test Account.`);
      console.log(`[MAIL] Ethereal Username: ${testAccount.user}`);
      console.log(`[MAIL] Ethereal Password: ${testAccount.pass}`);

      try {
        await transporter.verify();
        console.log('[MAIL] Ethereal fallback Transporter verified successfully.');
      } catch (verifyErr) {
        console.error(`[MAIL ERROR] Ethereal Transporter verification failed: ${verifyErr.message}`);
      }
    } catch (err) {
      console.error('[MAIL] Failed to create Ethereal test account:', err.message);
      transporter = {
        sendMail: async (options) => {
          console.log(`[MAIL MOCK] Mail sent (Simulated). Dest: ${options.to}, Subject: ${options.subject}`);
          return { messageId: 'mock-id-12345' };
        },
        verify: async () => true,
      };
    }
  }
  return transporter;
};

const sendMail = async ({ to, subject, html, fromName = 'PizzaPilot', fromEmail = 'no-reply@pizzapilot.com' }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (apiKey) {
    console.log(`[MAIL] Sending email via Brevo HTTPS API to ${to}...`);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: fromName,
            email: fromEmail
          },
          to: [
            {
              email: to
            }
          ],
          subject: subject,
          htmlContent: html
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API responded with status ${response.status}`);
      }
      console.log(`[MAIL] Email sent successfully via Brevo API. Message ID: ${data.messageId}`);
      return { success: true };
    } catch (err) {
      console.error(`[MAIL ERROR] Brevo API send failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  } else {
    // Local development fallback: Nodemailer + Ethereal
    console.log(`[MAIL] BREVO_API_KEY is not configured. Falling back to local Ethereal SMTP transporter.`);
    try {
      const mailTransporter = await createTransporter();
      const info = await mailTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      let previewUrl = null;
      try {
        previewUrl = nodemailer.getTestMessageUrl(info);
      } catch (previewErr) {
        // Ignore mock transporter check
      }

      if (previewUrl) {
        console.log(`[MAIL] Ethereal Preview Link: ${previewUrl}`);
      }
      return { success: true, previewUrl };
    } catch (err) {
      console.error(`[MAIL ERROR] Ethereal SMTP send failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
};

export const sendVerificationEmail = async (email, name, token) => {
  try {
    const verificationUrl = `${getFrontendUrl()}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    console.log(`[MAIL] Dispatching Verification URL to ${email}: ${verificationUrl}`);

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #f43f5e; margin-bottom: 20px;">Welcome to PizzaPilot! 🍕</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>This verification link is valid for 1 hour.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #64748b;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">PizzaPilot - Professional Pizza & Inventory Platform</p>
      </div>
    `;

    return await sendMail({
      to: email,
      subject: 'Verify your PizzaPilot Account 🍕',
      html,
    });
  } catch (error) {
    console.error(`[MAIL ERROR] Verification email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;
    console.log(`[MAIL] Dispatching Password Reset URL to ${email}: ${resetUrl}`);

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #f43f5e; margin-bottom: 20px;">Reset Your Password 🔑</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your PizzaPilot password. If you didn't request this, you can ignore this email.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This link is valid for 1 hour.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #64748b;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">PizzaPilot - Professional Pizza & Inventory Platform</p>
      </div>
    `;

    return await sendMail({
      to: email,
      subject: 'Reset your PizzaPilot Password 🔑',
      html,
    });
  } catch (error) {
    console.error(`[MAIL ERROR] Password reset email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendLowStockAlertEmail = async (adminEmail, items) => {
  try {
    let itemsHtml = '';
    for (const item of items) {
      itemsHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; color: #1e293b;">${item.name}</td>
          <td style="padding: 10px; text-transform: capitalize; color: #475569;">${item.category}</td>
          <td style="padding: 10px; color: #dc2626; font-weight: bold;">${item.quantity}</td>
          <td style="padding: 10px; color: #475569;">${item.threshold}</td>
          <td style="padding: 10px; color: #64748b;">${new Date(item.lastUpdated).toLocaleString()}</td>
        </tr>
      `;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 8px; background-color: #fef2f2;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">
          ⚠️ Low Stock Alert - PizzaPilot Console
        </h2>
        <p>Hello Admin,</p>
        <p>The following inventory ingredients have dropped below their defined threshold. Please arrange restock orders as soon as possible.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <thead>
            <tr style="background-color: #dc2626; color: white; text-align: left;">
              <th style="padding: 12px 10px;">Item Name</th>
              <th style="padding: 12px 10px;">Category</th>
              <th style="padding: 12px 10px;">Current Stock</th>
              <th style="padding: 12px 10px;">Threshold</th>
              <th style="padding: 12px 10px;">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr style="border: 0; border-top: 1px solid #fca5a5; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">PizzaPilot Admin Cron System • Auto-Notification</p>
      </div>
    `;

    return await sendMail({
      to: adminEmail,
      subject: '⚠️ LOW STOCK ALERT: PizzaPilot Inventory Critical',
      html,
      fromName: 'PizzaPilot Alert',
      fromEmail: 'alerts@pizzapilot.com',
    });
  } catch (error) {
    console.error(`[MAIL ERROR] Low stock alert email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};
