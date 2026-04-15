export const getVerificationStatusEmail = (
  name: string, 
  lrNumber: string, 
  status: 'verified' | 'rejected', 
  comments?: string
) => {
  const isVerified = status === 'verified';
  return {
    subject: `Update: Verification for LR No: ${lrNumber}`,
    body: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Land Verification Result</h2>
        <p>Hello ${name},</p>
        <p>The Land Officer has completed the review of your property submission for <strong>LR No: ${lrNumber}</strong>.</p>
        
        <p>Status: <strong style="color: ${isVerified ? '#28a745' : '#dc3545'}; text-transform: uppercase;">${status}</strong></p>
        
        ${!isVerified && comments ? `<p style="color: #721c24; background: #f8d7da; padding: 10px;">Reason: ${comments}</p>` : ''}
        
        <p>${isVerified 
          ? 'Your land is now listed as "Verified" on the digital registry and is eligible for blockchain-based transfer.' 
          : 'Please review the comments above and resubmit your documents through the portal.'}</p>
        
        <p style="margin-top: 25px;"><a href="http://localhost:5173/dashboard">Go to Dashboard</a></p>
      </div>
    `
  };
};