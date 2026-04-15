import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
} from "./user.controller";
// Using your new refined guards
import { 
  adminAuth, 
  officerAuth, 
  anyRoleAuth, 
  officialAuth 
} from "../middleware/bearAuth";

export const userRouter: Router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all registered users/citizens
 * @access  Private (Admin & Land Officers only)
 */
userRouter.get("/", officialAuth, getUsers);

/**
 * @route   PUT /api/users/profile
 * @desc    Allows any logged-in user to update their own profile details
 * @access  Private (Citizen, Officer, or Admin)
 */
userRouter.put("/profile", anyRoleAuth, updateProfile);

/**
 * @route   GET /api/users/:id
 * @desc    Get details of a specific user
 * @access  Private (Admin & Land Officers)
 */
userRouter.get("/:id", officialAuth, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Admin manually updates user roles or status
 * @access  Private (Admin Only)
 */
userRouter.put("/:id", adminAuth, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Admin deletes a user from the system
 * @access  Private (Admin Only)
 */
userRouter.delete("/:id", adminAuth, deleteUser);