export {}; // This ensures the file is treated as a module

declare global {
  namespace Express {
    // This merges with the existing Express Request interface
    interface Request {
      user?: {
        userId: number;
        role: string;
        email?: string;
      };
    }
  }
}