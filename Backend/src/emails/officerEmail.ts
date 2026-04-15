export const getOfficerOnboardingEmail = (name: string, officeLocation: string) => {
  return {
    subject: "Official Appointment: Land Verification Officer",
    body: `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #1a2a6c;">Welcome, Officer ${name}</h2>
        <p>Your account has been activated for the <strong>${officeLocation}</strong> branch.</p>
        <p>Your primary responsibility is to review <strong>Land Verification Requests</strong> and cross-reference physical titles with our digital blockchain records.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
           <strong>Duty:</strong> Ensure all IPFS document hashes match physical site plans before clicking "Approve".
        </div>
        <p style="margin-top: 20px;">Log in here: <a href="http://localhost:5173/login">Officer Portal</a></p>
      </div>
    `
  };
};