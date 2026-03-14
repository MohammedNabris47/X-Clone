import express from "express";
import { getMe, login, logout, signup } from "../controller/authController.js";
import protectRoute from "../middleware/protectRoute.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protectRoute, getMe);
export default authRouter;
