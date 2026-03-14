import Notification from "../model/notificationModel.js";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }

    return res
      .status(200)
      .json({ message: "User Fetched Successfully.", user });
  } catch (error) {
    console.error(`Error in getProfile controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const findUser = await User.findById({ _id: id });
    const currentUser = await User.findById({ _id: req.user._id });

    if (id === req.user._id) {
      return res.status(400).json({ error: "You can't follow/unfollow." });
    }

    if (!findUser || !currentUser) {
      return res.status(404).json({ error: "User Not Found." });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: req.user._id } },
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $pull: { following: id } },
      );
      return res.status(200).json({ message: "Unfollow Successfully." });
    } else {
      //follow
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: req.user._id } },
      );

      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $push: { following: id } },
      );

      const newNotification = new Notification({
        from: req.user._id,
        type: "follow",
        to: findUser._id,
      });
      await newNotification.save();
      return res.status(200).json({ message: "Follow Successfully." });
    }
  } catch (error) {
    console.error(`Error in followUnFollowUser controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    let userFollowedByMe = await User.findById({ _id: userId }).select(
      "-password",
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    let filteredUser = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id),
    );
    let suggestedUsers = filteredUser.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(`Error in getSuggestedUsers controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      username,
      fullName,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profileImg, coverImg } = req.body;

    let user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res.status(400).json({
        error: "Please Provide Both New Password & Current Password.",
      });
    }

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Current Password is Incorrect.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "Password must have at least 6 characters.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      //https://res.cloudinary.com/dcp75ipt/image/upload/v175546982/cld-sample-4.jpg
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0],
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0],
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;
    return res.status(200).json({ message: "User Updated Successfully", user });
  } catch (error) {
    console.error(`Error in updateUser controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};
