/**
 * adminEmail.ts
 * Templates for System Administrators
 */

export const getAdminWelcomeEmail = (name: string) => {
  return {
    subject: "Welcome to Land Registry Administration!",
    body: `
      <div style="font-family: sans-serif; color: #333;">
        <div style="background-color: #1a2a6c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Admin Portal Access</h1>
        </div>
        <div style="padding: 25px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>You have been officially onboarded as a <strong>System Administrator</strong> for the Blockchain Land Registry.</p>
          <p>Your account allows you to:</p>
          <ul>
            <li>Manage and verify Land Officers.</li>
            <li>Monitor global land audit logs.</li>
            <li>Oversee system-wide blockchain transaction statuses.</li>
          </ul>
          <p style="background: #fff3cd; padding: 10px; border-left: 5px solid #ffecb5;">
            <strong>Security Reminder:</strong> Your actions are recorded in the immutable audit log. Always ensure your session is secure.
          </p>
          <p><a href="http://localhost:5173/admin/login">Access Admin Console</a></p>
        </div>
      </div>
    `
  };
};

export const AdminCreateWelcomeEmail = (email: string, firstName: string, plainPassword: string) => {
  return {
    subject: "⚠️ Admin Credentials - Blockchain Land Portal",
    body: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #1a2a6c;">Admin Account Created, ${firstName}!</h2>
        <p>An account has been set up for you with Administrative privileges.</p>
        <div style="background: #f4f4f4; padding: 15px; margin: 20px 0;">
          <strong>Login Credentials:</strong><br>
          <strong>Email:</strong> ${email}<br>
          <strong>Temporary Password:</strong> ${plainPassword}
        </div>
        <p>Login here: <a href="http://localhost:5173/admin/login">Admin Dashboard</a></p>
        <p><strong>Please change this password immediately after your first login.</strong></p>
        <p>Best regards,<br/>The System Security Team</p>
      </div>
    `
  };
};