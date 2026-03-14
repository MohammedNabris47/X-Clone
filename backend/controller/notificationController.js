import Notification from "../model/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notification);
  } catch (error) {
    console.error(`Error in getNotifications controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    return res
      .status(200)
      .json({ message: "Notification Deleted Successfully." });
  } catch (error) {
    console.error(`Error in deleteNotifications controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};
