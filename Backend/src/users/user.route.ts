import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
} from "./user.controller";
import { authMiddleware, adminOnly, officerOnly } from "../middleware/bearAuth";

export const userRouter: Router = Router();
// Only Admins or Land Officers can see all citizens
userRouter.get("/", authMiddleware, officerOnly, getUsers);

// Profile management
userRouter.put("/profile", authMiddleware, updateProfile);

// Specific user management (Admin Only)
userRouter.get("/:id", authMiddleware, officerOnly, getUserById);
userRouter.put("/:id", authMiddleware, adminOnly, updateUser);
userRouter.delete("/:id", authMiddleware, adminOnly, deleteUser);