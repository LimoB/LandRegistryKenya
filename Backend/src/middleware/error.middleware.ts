import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log full stack trace to the server terminal for debugging
  console.error("--- ERROR DEBUGGER ---");
  console.error(`Path: ${req.path}`);
  console.error(`Method: ${req.method}`);
  console.error(err.stack); 
  console.error("----------------------");

  res.status(statusCode).json({
    success: false,
    message: message,
    // stack includes file names and line numbers
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};