import nodemailer from 'nodemailer';

let transporter;

const createTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[MAIL] Configured SMTP Transporter.');
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
      });
      console.log(`[MAIL] SMTP environment variables not configured. Created dynamic Ethereal Test Account.`);
      console.log(`[MAIL] Ethereal Username: ${testAccount.user}`);
      console.log(`[MAIL] Ethereal Password: ${testAccount.pass}`);
    } catch (err) {
      console.error('[MAIL] Failed to create Ethereal test account:', err.message);
      transporter = {
        sendMail: async (options) => {
          console.log(`[MAIL MOCK] Mail sent (Simulated). Dest: ${options.to}, Subject: ${options.subject}`);
          return { messageId: 'mock-id-12345' };
        }
      };
    }
  }
  return transporter;
};

export const sendVerificationEmail = async (email, name, token) => {
  try {
    const mailTransporter = await createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

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

    const info = await mailTransporter.sendMail({
      from: '"PizzaPilot" <no-reply@pizzapilot.com>',
      to: email,
      subject: 'Verify your PizzaPilot Account 🍕',
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[MAIL] Verification Email Link (Ethereal Preview): ${previewUrl}`);
    }
    return { success: true, previewUrl };
  } catch (error) {
    console.error(`[MAIL ERROR] Verification email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const mailTransporter = await createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

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

    const info = await mailTransporter.sendMail({
      from: '"PizzaPilot" <no-reply@pizzapilot.com>',
      to: email,
      subject: 'Reset your PizzaPilot Password 🔑',
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[MAIL] Reset Password Email Link (Ethereal Preview): ${previewUrl}`);
    }
    return { success: true, previewUrl };
  } catch (error) {
    console.error(`[MAIL ERROR] Password reset email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendLowStockAlertEmail = async (adminEmail, items) => {
  try {
    const mailTransporter = await createTransporter();

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

    const info = await mailTransporter.sendMail({
      from: '"PizzaPilot Alert" <alerts@pizzapilot.com>',
      to: adminEmail,
      subject: '⚠️ LOW STOCK ALERT: PizzaPilot Inventory Critical',
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[MAIL] Low Stock Email Link (Ethereal Preview): ${previewUrl}`);
    }
    return { success: true, previewUrl };
  } catch (error) {
    console.error(`[MAIL ERROR] Low stock alert email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};
