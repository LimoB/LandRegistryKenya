import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Matches your Drizzle userRoleEnum exactly
type UserRole = 'admin' | 'land_officer' | 'citizen';

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
      land_officer: '📜 Land Registry - Official Verification Portal',
      citizen: '🏛️ Blockchain Land Registry - Secure Services',
      admin: '🛡️ Land Registry - System Administration',
    };

    const emailHeading = heading ?? defaultHeadingMap[role] ?? '🏛️ Blockchain Land Registry';

    const mailOptions = {
      from: `"Blockchain Land Registry" <${process.env.EMAIL_SENDER}>`,
      to: recipientEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f7f6;
              margin: 0;
              padding: 0;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              padding: 0;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
              border: 1px solid #e0e0e0;
              color: #2c3e50;
            }
            .header-bar {
              background-color: #1a2a6c; /* Navy blue for authority */
              padding: 20px;
              text-align: center;
              color: #ffffff;
            }
            .content {
              padding: 30px;
              line-height: 1.6;
            }
            h2 {
              margin: 0;
              font-size: 20px;
              font-weight: 600;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 15px;
            }
            .blockchain-note {
              background-color: #f0f4ff;
              border-left: 4px solid #1a2a6c;
              padding: 15px;
              margin: 20px 0;
              font-size: 0.9em;
              color: #444;
            }
            .footer {
              font-size: 12px;
              color: #7f8c8d;
              padding: 20px;
              text-align: center;
              background-color: #fcfcfc;
              border-top: 1px solid #eeeeee;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header-bar">
              <h2>${emailHeading}</h2>
            </div>
            
            <div class="content">
              <div class="greeting">Hello, ${recipientName}</div>
              ${messageHtml}
              
              <div class="blockchain-note">
                <strong>Note:</strong> All land transfers processed via this portal are cryptographically secured and recorded on the blockchain for permanent immutability.
              </div>
              
              <p>Regards,<br><strong>Land Registry Digital Team</strong></p>
            </div>

            <div class="footer">
              &copy; ${new Date().getFullYear()} Blockchain Land Registry System. 
              All land records are public and verifiable on the network.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`[sendLandPortalEmail] Sending to ${recipientEmail} [Role: ${role}]`);

    const result = await transporter.sendMail(mailOptions);

    if (result.accepted.length > 0) {
      return 'Email sent successfully';
    } 
    return 'Email failed delivery';

  } catch (error) {
    console.error('[sendLandPortalEmail] Error:', error);
    return 'Email sending failed';
  }
};