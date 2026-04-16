import { Request, Response, NextFunction } from "express";
import {
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  updateProfileService
} from "./user.service";

/* ================================
   GET USERS
================================ */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUsersService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/* ================================
   GET USER BY ID
================================ */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserByIdService(Number(req.params.id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
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
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedUser = await updateUserService(
      adminId,
      Number(req.params.id),
      req.body
    );

    res.status(200).json(updatedUser);
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await updateProfileService(userId, req.body);

    res.status(200).json(updatedUser);
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
      return res.status(403).json({ message: "Forbidden" });
    }

    await deleteUserService(adminId, Number(req.params.id));

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};