import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  deleteNotifications,
  getNotifications,
} from "../controller/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protectRoute, getNotifications);
notificationRouter.delete("/", protectRoute, deleteNotifications);
export default notificationRouter;
