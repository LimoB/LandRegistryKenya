export const getResendVerificationEmail = (name: string, verificationLink: string) => {
  return {
    subject: "Action Required: Verify Your Land Portal Identity",
    body: `
      <div style="font-family: sans-serif; color: #333; text-align: center;">
        <h2 style="color: #1a2a6c;">Email Verification</h2>
        <p>Hello ${name},</p>
        <p>You requested a new verification link for your Land Registry account.</p>
        <p>To ensure the security of your property assets and blockchain transactions, we need you to verify your email address.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" style="background: #1a2a6c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Account</a>
        </div>
        <p style="font-size: 0.9em; color: #666;">This link will expire in 24 hours.</p>
      </div>
    `
  };
};