import { Request, Response, NextFunction } from "express";
import {
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  updateProfileService
} from "./user.service";

/* ================================
   GET ALL USERS (ADMIN)
================================ */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUsersService();
    
    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET CURRENT USER (ME)
================================ */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract userId from the authenticated token (set by bearAuth middleware)
    const userId = req.user?.userId;

    if (!userId) {
      const error: any = new Error("Unauthorized: No session found");
      error.statusCode = 401;
      throw error;
    }

    const user = await getUserByIdService(Number(userId));

    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET USER BY ID
=============================== */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    
    // Safety check: If the route is /me but hits this by mistake
    if (isNaN(userId)) {
      const error: any = new Error("Invalid User ID format");
      error.statusCode = 400;
      throw error;
    }

    const user = await getUserByIdService(userId);

    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE USER (ADMIN ONLY)
================================ */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    const role = req.user?.role;

    if (!adminId || role !== "admin") {
      const error: any = new Error("Forbidden: Admin access required");
      error.statusCode = 403;
      throw error;
    }

    const updatedUser = await updateUserService(
      Number(adminId),
      Number(req.params.id),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully by admin",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   UPDATE PROFILE (SELF)
================================ */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error: any = new Error("Unauthorized: No session found");
      error.statusCode = 401;
      throw error;
    }

    const updatedUser = await updateProfileService(Number(userId), req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/* ================================
   DELETE USER (ADMIN ONLY)
================================ */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    const role = req.user?.role;

    if (!adminId || role !== "admin") {
      const error: any = new Error("Forbidden: You do not have permission to delete users");
      error.statusCode = 403;
      throw error;
    }

    await deleteUserService(Number(adminId), Number(req.params.id));

    return res.status(200).json({ 
      success: true,
      message: "User deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};