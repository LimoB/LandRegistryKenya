export const getPasswordResetEmail = (name: string, resetLink: string) => {
  return {
    subject: "Reset Your Land Registry Password",
    body: `
      <div style="font-family: sans-serif; color: #333; text-align: center;">
        <h2 style="color: #c0392b;">Security Alert: Password Reset</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset the password for your Blockchain Land Registry account.</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" style="background: #1a2a6c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
        </p>
        <p>This link will expire in 1 hour. If you did not request this, please change your security settings immediately.</p>
      </div>
    `
  };
};