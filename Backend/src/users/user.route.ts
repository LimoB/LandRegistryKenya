import { Router } from "express";
import {
  getUsers,
  getUserById,
  getMe,           // <--- Import the new controller
  updateUser,
  deleteUser,
  updateProfile,
} from "./user.controller";

import {
  adminAuth,
  anyRoleAuth,
  officialAuth
} from "../middleware/bearAuth";

export const userRouter: Router = Router();

/**
 * ================================
 * PROFILE (SELF)
 * ================================
 */

/**
 * @route   GET /api/users/me
 * @desc    Get current logged in user details
 * @access  Private (Any authenticated user)
 */
// This MUST be above /:id
userRouter.get("/me", anyRoleAuth, getMe);

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private (Any authenticated user)
 */
userRouter.put("/profile", anyRoleAuth, updateProfile);


/**
 * ================================
 * USERS (ADMIN / OFFICERS)
 * ================================
 */

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin & Land Officers)
 */
userRouter.get("/", officialAuth, getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin & Land Officers)
 */
userRouter.get("/:id", officialAuth, getUserById);


/**
 * ================================
 * ADMIN ACTIONS
 * ================================
 */

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (role, verification)
 * @access  Private (Admin only)
 */
userRouter.put("/:id", adminAuth, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
userRouter.delete("/:id", adminAuth, deleteUser);