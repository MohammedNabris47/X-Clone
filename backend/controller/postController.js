import Notification from "../model/notificationModel.js";
import Post from "../model/postModel.js";
import User from "../model/userModel.js";
import { v2 as cloudinary } from "cloudinary";
export const createPost = async (req, res) => {
  try {
    let { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post Must Have Text or Image." });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    return res
      .status(201)
      .json({ message: "Post Added Successfully.", newPost });
  } catch (error) {
    console.error(`Error in createPost controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ _id: id });
    if (!post) {
      return res.status(404).json({ error: "Post Not Found." });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post." });
    }
    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0],
      );
    }
    await Post.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "Post Deleted Successfully." });
  } catch (error) {
    console.error(`Error in deletePost controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: "Comment Text is Required." });
    }

    let post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post Not Found." });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();
    return res
      .status(201)
      .json({ message: "Comment Added Successfully.", post });
  } catch (error) {
    console.error(`Error in createComment controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    let post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post Not Found." });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      //unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      return res.status(200).json(updatedLikes);
    } else {
      //like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const newNotification = new Notification({
        type: "like",
        from: userId,
        to: post.user,
      });

      await newNotification.save();
      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.error(`Error in likeUnlikePost controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-email",
          "-following",
          "-followers",
          "-bio",
          "-link",
        ],
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res
      .status(200)
      .json({ message: "All Posts Fetched Successfully.", posts });
  } catch (error) {
    console.error(`Error in getAllPosts controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const getLikedPost = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: [
          "-password",
          "-email",
          "-following",
          "-followers",
          "-bio",
          "-link",
        ],
      });
    return res
      .status(200)
      .json({ message: "Liked Posts Fetched Successfully.", likedPosts });
  } catch (error) {
    console.error(`Error in getLikedPost controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })

      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: ["-password", "-email"],
      });
    return res.status(200).json(feedPosts);
  } catch (error) {
    console.error(`Error in getFollowingPosts controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in getUserPosts controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};
