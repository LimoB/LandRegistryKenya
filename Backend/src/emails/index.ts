// 1. New Blockchain Roles
export { getOfficerOnboardingEmail } from './officerEmail'; 
export { getCitizenWelcomeEmail, CitizenCreateWelcomeEmail } from './citizenEmail'; 
export { getAdminWelcomeEmail, AdminCreateWelcomeEmail } from './adminEmail';

// 2. Auth & Security (Nodemailer Flows)
export { getPasswordResetEmail } from './forgotPasswordMail';
export { getPasswordResetSuccessEmail } from './passwordResetSuccessMail';
export { getResendVerificationEmail } from './resendVerificationMail';

// 3. New Blockchain Specific Templates
export { getLandTransferNotificationEmail } from './transferEmail';
export { getVerificationStatusEmail } from './verificationStatusEmail';