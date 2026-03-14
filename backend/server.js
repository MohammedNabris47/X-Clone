import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import postRouter from "./routes/postRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3500;
// const __dirname = path.resolve();
app.use(
  express.json({
    limit: "10mb",
  }),
);
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
await connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.use((req, res) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
    } else {
      res.status(404).send("Not Found");
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
