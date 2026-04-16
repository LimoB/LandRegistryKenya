import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ============================================================
   ENV SAFETY CHECK (prevents silent runtime crashes)
============================================================ */
if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
  throw new Error("EMAIL_SENDER or EMAIL_PASSWORD is missing in .env");
}

/* ============================================================
   TRANSPORTER
============================================================ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* ============================================================
   USER ROLES
============================================================ */
export type UserRole = "admin" | "land_officer" | "citizen";

/* ============================================================
   EMAIL FUNCTION
============================================================ */
export const sendLandPortalEmail = async (
  recipientEmail: string,
  recipientName: string,
  subject: string,
  messageHtml: string,
  role: UserRole,
  heading?: string
): Promise<string> => {
  try {
    const defaultHeadingMap: Record<UserRole, string> = {
      land_officer: "📜 Land Registry - Official Verification Portal",
      citizen: "🏛️ Blockchain Land Registry - Secure Services",
      admin: "🛡️ Land Registry - System Administration",
    };

    const emailHeading =
      heading ?? defaultHeadingMap[role] ?? "🏛️ Blockchain Land Registry";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f7f6;
            margin: 0;
            padding: 0;
          }
          .wrapper {
            max-width: 600px;
            margin: 30px auto;
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #ddd;
          }
          .header {
            background: #1a2a6c;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 25px;
            color: #333;
            line-height: 1.6;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .note {
            margin-top: 20px;
            padding: 12px;
            background: #eef3ff;
            border-left: 4px solid #1a2a6c;
            font-size: 13px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding: 15px;
            background: #fafafa;
          }
          a.button {
            display: inline-block;
            padding: 10px 18px;
            background: #1a2a6c;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          
          <div class="header">
            <h3>${emailHeading}</h3>
          </div>

          <div class="content">
            <div class="greeting">Hello ${recipientName},</div>

            ${messageHtml}

            <div class="note">
              <strong>Security Notice:</strong> All transactions are encrypted and stored on blockchain for immutability and auditability.
            </div>

            <p style="margin-top:20px;">Regards,<br><strong>Kenyan Land Registry Team</strong></p>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} Blockchain Land Registry System
          </div>

        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Land Registry" <${process.env.EMAIL_SENDER}>`,
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: messageHtml.replace(/<[^>]*>/g, ""), // fallback plain text
    };

    console.log(`[EMAIL] Sending to ${recipientEmail} (${role})`);

    const result = await transporter.sendMail(mailOptions);

    if (result.accepted?.length) {
      return "Email sent successfully";
    }

    return "Email not delivered";
  } catch (error) {
    console.error("[sendLandPortalEmail] Error:", error);
    return "Email sending failed";
  }
};