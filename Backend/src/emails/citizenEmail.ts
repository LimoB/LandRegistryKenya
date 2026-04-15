/**
 * citizenEmail.ts
 * Replaces the old userEmail.ts template
 * Focuses on Blockchain Identity and Land Registry onboarding
 */

export const getCitizenWelcomeEmail = (name: string, walletAddress: string) => {
  return {
    subject: "Welcome to the Blockchain Land Registry Portal",
    body: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; line-height: 1.6;">
        <div style="background-color: #1a2a6c; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to the Future of Land Ownership</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
          
          <p>Your account on the <strong>Blockchain Land Registry</strong> has been successfully created. You are now part of a secure, transparent, and immutable ecosystem for property management.</p>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; border: 1px dashed #1a2a6c;">
            <p style="margin: 0; color: #1a2a6c; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Linked Wallet Address</p>
            <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 14px; word-break: break-all; color: #555;">
              ${walletAddress}
            </p>
          </div>

          <h3 style="color: #1a2a6c;">What can you do now?</h3>
          <ul style="padding-left: 20px;">
            <li><strong>Register Land:</strong> Submit your title deed (LR Number) for official verification.</li>
            <li><strong>Digital Provenance:</strong> View the immutable history of any land parcel.</li>
            <li><strong>Secure Transfers:</strong> Buy or sell land directly using smart contracts.</li>
          </ul>

          <p style="margin-top: 30px; text-align: center;">
            <a href="http://localhost:5173/dashboard" style="background-color: #1a2a6c; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Dashboard</a>
          </p>

          <p style="font-size: 0.9em; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <strong>Important Security Tip:</strong> Our officers will never ask for your private keys or seed phrases. Only use this portal to sign official land transactions.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} Blockchain Land Registry System. Securely recorded on the network.
        </div>
      </div>
    `
  };
};

/**
 * For cases where an admin manually adds a citizen
 */
export const CitizenCreateWelcomeEmail = (name: string, email: string, temporaryPassword: string) => {
  return {
    subject: "Account Created: Blockchain Land Portal",
    body: `
      <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #1a2a6c;">Official Citizen Account Created</h2>
        <p>Hello ${name},</p>
        <p>An administrator has created an account for you on the Blockchain Land Registry.</p>
        
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Login Credentials:</strong><br>
          Email: ${email}<br>
          Temporary Password: <code style="color: #d63384;">${temporaryPassword}</code>
        </div>
        
        <p>Please log in and change your password immediately. You will also be prompted to link your <strong>Web3 Wallet</strong> to start managing land assets.</p>
        
        <p><a href="http://localhost:5173/login" style="color: #1a2a6c; font-weight: bold;">Click here to Login</a></p>
      </div>
    `
  };
};