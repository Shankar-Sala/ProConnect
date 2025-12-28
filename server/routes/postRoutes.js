import express from "express";
import { protect } from "../middlewares/auth";
import { addPost, getFeedPosts, likePost } from "../controllers/postController";
import { upload } from "../configs/multer";

const postRouter = express.Router();

postRouter.post("/add", upload.array("images", 4), protect, addPost);
postRouter.get("/feed", protect, getFeedPosts);
postRouter.post("/like", protect, likePost);

export default postRouter;
