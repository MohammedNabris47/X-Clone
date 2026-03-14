import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  followUnFollowUser,
  getProfile,
  getSuggestedUsers,
  updateUser,
} from "../controller/userController.js";

const userRouter = express.Router();

userRouter.get("/profile/:username", protectRoute, getProfile);
userRouter.post("/follow/:id", protectRoute, followUnFollowUser);
userRouter.get("/suggested", protectRoute, getSuggestedUsers);
userRouter.post("/update", protectRoute, updateUser);
export default userRouter;
