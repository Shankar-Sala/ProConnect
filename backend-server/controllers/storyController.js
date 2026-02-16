import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";
import imagekit from "../configs/imageKit.js";


// Add user story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;

    let media_url = "";

    // ✅ Upload media to ImageKit (if image or video)
    if ((media_type === "image" || media_type === "video") && media) {

      // Validate media type
      if (!media.mimetype.startsWith("image/") && 
          !media.mimetype.startsWith("video/")) {
        return res.json({
          success: false,
          message: "Only image or video files are allowed",
        });
      }

      const base64File = media.buffer.toString("base64");

      const response = await imagekit.files.upload({
        file: base64File,
        fileName: `${userId}-${Date.now()}-${media.originalname}`,
        folder: "stories",
      });

      media_url = response.url;
    }

    // ✅ Create story
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // ✅ Schedule deletion after 24 hours
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    res.json({ success: true, story });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Get User Stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    //user coonections and followers
    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};