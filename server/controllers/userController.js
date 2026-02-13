import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from "fs";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import { inngest } from "../inngest/index.js";
import { clerkClient } from "@clerk/express";

// ======================================================
// 🔥 GET USER DATA (FINAL SAFE UPSERT VERSION)
// ======================================================
export const getUserData = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    // Fetch Clerk user
    const clerkUser = await clerkClient.users.getUser(userId);

    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "noemail@example.com";

    const full_name =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      "User";

    const username =
      clerkUser.username ||
      (email ? email.split("@")[0] : `user_${userId.slice(-6)}`);

    // 🔥 UPSERT (no duplicate error ever)
    const user = await User.findByIdAndUpdate(
      userId,
      {
        _id: userId,
        email,
        full_name,
        username,
      },
      {
        new: true,
        upsert: true, // 🔥 This prevents duplicate key error
        setDefaultsOnInsert: true,
      }
    );

    return res.json({ success: true, user });

  } catch (error) {
    console.log("getUserData error:", error);
    return res.json({ success: false, message: error.message });
  }
};



// ======================================================
// 🔥 UPDATE USER PROFILE
// ======================================================
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

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    // 🔥 Upload profile image
    if (profile) {
      const response = await imagekit.files.upload({
        file: fs.createReadStream(profile.path),
        fileName: profile.originalname,
      });

      const url = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: 512 },
        ],
      });

      updatedData.profile_picture = url;
      fs.unlink(profile.path, () => {});
    }

    // 🔥 Upload cover image
    if (cover) {
      const response = await imagekit.files.upload({
        file: fs.createReadStream(cover.path),
        fileName: cover.originalname,
      });

      const url = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: 1280 },
        ],
      });

      updatedData.cover_photo = url;
      fs.unlink(cover.path, () => {});
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.log("updateUserData error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 DISCOVER USERS
// ======================================================
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter(
      (user) => user._id !== userId
    );

    return res.json({ success: true, users: filteredUsers });

  } catch (error) {
    console.log("discoverUsers error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 FOLLOW USER
// ======================================================
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "Already following",
      });
    }

    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    return res.json({
      success: true,
      message: "Followed successfully",
    });

  } catch (error) {
    console.log("followUser error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 UNFOLLOW USER
// ======================================================
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    user.following = user.following.filter(
      (uid) => uid !== id
    );
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter(
      (uid) => uid !== userId
    );
    await toUser.save();

    return res.json({
      success: true,
      message: "Unfollowed successfully",
    });

  } catch (error) {
    console.log("unfollowUser error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 SEND CONNECTION REQUEST
// ======================================================
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const existing = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Connection already exists or pending",
      });
    }

    const newConnection = await Connection.create({
      from_user_id: userId,
      to_user_id: id,
    });

    await inngest.send({
      name: "app/connection-request",
      data: { connectionId: newConnection._id },
    });

    return res.json({
      success: true,
      message: "Connection request sent",
    });

  } catch (error) {
    console.log("sendConnectionRequest error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 ACCEPT CONNECTION REQUEST
// ======================================================
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({
        success: false,
        message: "Connection not found",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    user.connections.push(id);
    toUser.connections.push(userId);

    await user.save();
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    return res.json({
      success: true,
      message: "Connection accepted successfully",
    });

  } catch (error) {
    console.log("acceptConnectionRequest error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 GET USER CONNECTIONS
// ======================================================
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId)
      .populate("connections followers following");

    return res.json({
      success: true,
      connections: user.connections,
      followers: user.followers,
      following: user.following,
    });

  } catch (error) {
    console.log("getUserConnections error:", error);
    return res.json({ success: false, message: error.message });
  }
};


// ======================================================
// 🔥 GET USER PROFILE
// ======================================================
export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;

    const profile = await User.findById(profileId);
    if (!profile) {
      return res.json({
        success: false,
        message: "Profile not found",
      });
    }

    const posts = await Post.find({ user: profileId })
      .populate("user");

    return res.json({
      success: true,
      profile,
      posts,
    });

  } catch (error) {
    console.log("getUserProfiles error:", error);
    return res.json({ success: false, message: error.message });
  }
};
