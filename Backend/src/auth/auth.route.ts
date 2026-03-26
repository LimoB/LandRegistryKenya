import { Router } from "express";
import { registerController, loginController } from "./auth.controller";

export const authRouter: Router = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);