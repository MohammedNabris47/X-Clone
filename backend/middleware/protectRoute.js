import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(400)
        .json({ error: "Unauthorized: No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(400).json({ error: "Unauthorized: Invalid Token." });
    }

    const user = await User.findOne({ _id: decoded.userId }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ error: "User Not Found." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(`Error in protectRoute : ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export default protectRoute;
