import { Router } from "express";
import {
  getUsers,
  getUserById,
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
 * PROFILE (SELF)
 * ================================
 */

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private (Any authenticated user)
 */
userRouter.put("/profile", anyRoleAuth, updateProfile);

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