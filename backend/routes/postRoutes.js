import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createComment,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPost,
  getUserPosts,
  likeUnlikePost,
} from "../controller/postController.js";

const postRouter = express.Router();

postRouter.get("/all", protectRoute, getAllPosts);
postRouter.get("/likes/:id", protectRoute, getLikedPost);
postRouter.get("/following", protectRoute, getFollowingPosts);
postRouter.get("/user/:username", protectRoute, getUserPosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.delete("/:id", protectRoute, deletePost);
postRouter.post("/comment/:id", protectRoute, createComment);
postRouter.post("/like/:id", protectRoute, likeUnlikePost);
export default postRouter;
