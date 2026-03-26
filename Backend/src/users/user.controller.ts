import { Request, Response, NextFunction } from "express";
import {
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  updateProfileService,
} from "./user.service";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUsersService();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserByIdService(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await updateUserService(Number(req.params.id), req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const message = await updateProfileService(userId, req.body);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteUserService(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};