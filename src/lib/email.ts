import nodemailer from 'nodemailer';

interface LeaveNotificationDetails {
  managerEmail: string;
  managerName: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

export async function sendLeaveNotificationEmail(details: LeaveNotificationDetails) {
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const recipientEmail = process.env.ADMIN_NOTIFY_EMAIL || 'yasheswinireddy18@gmail.com';
  const smtpUser = process.env.SMTP_USER || 'yasheswinireddy18@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'farqhpszsugpmskc';

  // Create transporter dynamically with port 587 (STARTTLS)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155;">
        <h2 style="color: #f59e0b; margin-top: 0;">📩 New Employee Leave Application Pending Review</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hello <strong>Yasheswini Mallela</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">An employee has submitted a new leave application in the portal:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; color: #f8fafc;">
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Employee Name:</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #ffffff;">${details.employeeName} (${details.department})</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Employee Email:</td>
            <td style="padding: 10px 0; text-align: right; color: #cbd5e1;">${details.employeeEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Leave Category:</td>
            <td style="padding: 10px 0; text-align: right; color: #38bdf8; font-weight: bold;">${details.leaveType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Leave Duration:</td>
            <td style="padding: 10px 0; text-align: right;">${details.startDate} to ${details.endDate} (<strong>${details.days} day(s)</strong>)</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Reason Provided:</td>
            <td style="padding: 10px 0; text-align: right; color: #e2e8f0;">"${details.reason}"</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${portalUrl}/admin/leaves" style="background-color: #d97706; color: #020617; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block;">
            Open Portal to Approve or Reject
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    console.log(`[EMAIL ENGINE] Dispatching Leave Application alert to target Admin: ${recipientEmail}...`);

    const info = await transporter.sendMail({
      from: `"Employee Leave Portal" <${smtpUser}>`,
      to: recipientEmail,
      subject: `📩 New Leave Application: ${details.employeeName} (${details.days} Day(s))`,
      html: htmlContent,
    });
    console.log(`✅ Email successfully sent to ${recipientEmail}! MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
  }
}
