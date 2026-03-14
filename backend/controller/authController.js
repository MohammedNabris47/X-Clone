import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid Email Address." });
    }

    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingEmail || existingUsername) {
      return res.status(400).json({ error: "User Already Exists." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must have at least 6 characters." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res
        .status(201)
        .json({ message: "User Created Successfully.", newUser });
    } else {
      return res.status(400).json({ message: "Invalid User Data." });
    }
  } catch (error) {
    console.error(`Error in signup controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || "",
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    generateToken(user._id, res);

    return res
      .status(200)
      .json({ message: "User LoggedIn Successfully.", user });
  } catch (error) {
    console.error(`Error in login controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({ message: "User LogOut Successfully." });
  } catch (error) {
    console.error(`Error in logout controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select("-password");
    return res
      .status(200)
      .json({ message: "User Fetched Successfully.", user });
  } catch (error) {
    console.error(`Error in getMe controller : ${error.message}`);
    res.status(500).json({ error: "Internal Sever Error." });
  }
};
