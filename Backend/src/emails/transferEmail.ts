export const getLandTransferNotificationEmail = (
  name: string, 
  lrNumber: string, 
  txHash: string, 
  role: 'buyer' | 'seller'
) => {
  const isBuyer = role === 'buyer';
  return {
    subject: `Immutable Record Created: Land Transfer ${lrNumber}`,
    body: `
      <div style="font-family: sans-serif; color: #333;">
        <div style="background: #1a2a6c; color: white; padding: 20px; text-align: center;">
          <h2>Land Transfer Confirmed</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #eee;">
          <p>Dear ${name},</p>
          <p>The blockchain transaction for <strong>LR No: ${lrNumber}</strong> has been successfully finalized.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <strong>Status:</strong> ${isBuyer ? 'Ownership Transferred to You' : 'Ownership Transferred to Buyer'}<br>
            <strong>Blockchain TX:</strong> <code style="word-break: break-all; color: #0056b3;">${txHash}</code>
          </div>

          <p>You can verify this record permanently on the Blockchain Explorer using the transaction hash provided above.</p>
        </div>
      </div>
    `
  };
};