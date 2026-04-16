export const getPasswordResetEmail = (name: string, otpCode: string) => {
  return {
    subject: "Your Password Reset Code (Land Registry)",
    body: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">

        <h2 style="color: #1a2a6c;">Password Reset Request</h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>We received a request to reset your password.</p>

        <p style="margin-top: 20px;">
          Use the 6-digit code below to continue:
        </p>

        <div style="
          font-size: 32px;
          letter-spacing: 10px;
          font-weight: bold;
          background: #f4f6f8;
          display: inline-block;
          padding: 15px 25px;
          border-radius: 10px;
          margin: 20px 0;
        ">
          ${otpCode}
        </div>

        <p>This code will expire in <strong>1 hour</strong>.</p>

        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          If you did not request this, please ignore this email or secure your account.
        </p>

      </div>
    `,
  };
};