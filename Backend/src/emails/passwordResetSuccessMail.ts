export const getPasswordResetSuccessEmail = (name: string) => {
  return {
    subject: "Security Alert: Password Changed Successfully",
    body: `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #28a745;">Password Updated</h2>
        <p>Hello ${name},</p>
        <p>This is a confirmation that the password for your <strong>Blockchain Land Registry</strong> account has been successfully changed.</p>
        <p>If you did not perform this action, please contact our support team immediately and secure your linked <strong>Wallet Address</strong>.</p>
        <p>For your security, you have been logged out of all other active sessions.</p>
        <hr />
        <p style="font-size: 0.8em; color: #888;">&copy; ${new Date().getFullYear()} Land Registry Security Team</p>
      </div>
    `
  };
};