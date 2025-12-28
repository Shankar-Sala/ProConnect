import { Console } from "console";
import imagekit from "../configs/imageKit.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import fs from "fs";
import Post from "../models/Post.js";
import { inngest } from "../inngest/index.js";

// ============================
// Get User Data
// ============================
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ============================
// Update User Data
// ============================
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!username) username = tempUser.username;

    if (tempUser.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = tempUser.username;
      }
    }

    const updatedData = { username, bio, location, full_name };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    // ---- Profile Image Upload ----
    if (profile) {
      const buffer = await fs.promises.readFile(profile.path);

      const response = await imagekit.files.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      updatedData.profile_picture = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: 512 },
        ],
      });

      await fs.promises.unlink(profile.path);
    }

    // ---- Cover Image Upload ----
    if (cover) {
      const buffer = await fs.promises.readFile(cover.path);

      const response = await imagekit.files.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      updatedData.cover_photo = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: 1280 },
        ],
      });

      await fs.promises.unlink(cover.path);
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ============================
// Discover Users
// ============================
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ============================
// Follow User
// ============================
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    user.following.push(id);
    toUser.followers.push(userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ============================
// Unfollow User
// ============================
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    user.following = user.following.filter((uid) => uid.toString() !== id);

    toUser.followers = toUser.followers.filter(
      (uid) => uid.toString() !== userId
    );

    await user.save();
    await toUser.save();

    res.json({
      success: true,
      message: "You are no longer following this user",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Send Connection Request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    //check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message:
          "You have sent more than 20 connection requests in the last 24 hours",
      });
    }

    //check if users are already connected
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
     const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      await inngest.send({
        name: "app/connection-request",
        data: {connectionId: newConnection._id}
      })

      return res.json({
        success: true,
        message: "Connection request sent successfully",
      });
    } else if (connection && connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }
    return res.json({ success: false, message: "Connection request pending" });
  } catch (error) {
    Console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Get User Connection
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId).populate(
      "connections followers following"
    );

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = (
      await connection
        .find({ to_user_id: userId, status: "pending" })
        .populate("from_user_id")
    ).map((connection) => connection.from_user_id);

    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    Console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({ success: false, message: "Connection not found" });
    }

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection accepted successfully" });
  } catch (error) {
    Console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get user profiles
export const getUserProfiles = async (params) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId);
    if (!profile) {
      return res.json({ success: false, message: "Profile not found" });
    }
    const posts = await Post.find({ user: profileId }).populate("user");
    res.json({ success: true, profile, posts });
  } catch (error) {
    Console.log(error);
    res.json({ success: false, message: error.message });
  }
};
