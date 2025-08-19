// server.js
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES6 module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// --- DB Connection ---
mongoose.connect("mongodb://localhost:27017/videoshare", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- Enhanced Models ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

const VideoSchema = new mongoose.Schema({
  caption: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  music: { type: String, default: "Original Sound" },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track who liked
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track who bookmarked
  createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

const FollowSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

// --- Models ---
const User = mongoose.model("User", UserSchema);
const Video = mongoose.model("Video", VideoSchema);
const Comment = mongoose.model("Comment", CommentSchema);
const Follow = mongoose.model("Follow", FollowSchema);

// --- Auth Middleware ---
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// --- Auth Routes ---
app.post("/api/register", async (req, res) => {
  try {
    const { username, displayName, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      displayName: displayName || username,
      password: hash 
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "24h" });
    
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "24h" });
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Video Upload Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// --- Video Routes ---
app.post("/api/upload", auth, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }
    
    const { caption, music } = req.body;
    
    const video = new Video({
      caption: caption || "No caption",
      filePath: req.file.path,
      music: music || "Original Sound",
      uploadedBy: req.userId,
    });
    
    await video.save();
    
    // Populate user data
    await video.populate("uploadedBy", "username displayName avatar");
    
    res.status(201).json({ 
      message: "Video uploaded successfully", 
      video: {
        id: video._id,
        caption: video.caption,
        url: `${req.protocol}://${req.get('host')}/${video.filePath}`,
        username: video.uploadedBy.username,
        displayName: video.uploadedBy.displayName,
        avatar: video.uploadedBy.avatar,
        likes: video.likes,
        comments: video.comments,
        shares: video.shares,
        bookmarks: video.bookmarks,
        music: video.music,
        createdAt: video.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Get Videos (TikTok-style feed) ---
app.get("/api/videos", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.headers["authorization"] ? 
      jwt.verify(req.headers["authorization"].replace("Bearer ", ""), "secretkey").id : null;
    
    const videos = await Video.find()
      .populate("uploadedBy", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const formattedVideos = videos.map(video => ({
      id: video._id,
      url: `${req.protocol}://${req.get('host')}/${video.filePath}`,
      username: video.uploadedBy.username,
      displayName: video.uploadedBy.displayName,
      caption: video.caption,
      likes: video.likes,
      comments: video.comments,
      shares: video.shares,
      bookmarks: video.bookmarks,
      music: video.music,
      isLiked: userId ? video.likedBy.includes(userId) : false,
      isBookmarked: userId ? video.bookmarkedBy.includes(userId) : false,
      isFollowing: false, // Will be updated with follow logic
      avatar: video.uploadedBy.avatar,
      createdAt: video.createdAt
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Like/Unlike Video ---
app.post("/api/videos/:id/like", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.userId;
    const isLiked = video.likedBy.includes(userId);

    if (isLiked) {
      // Unlike the video
      video.likedBy = video.likedBy.filter(id => id.toString() !== userId);
      video.likes = Math.max(0, video.likes - 1);
    } else {
      // Like the video
      video.likedBy.push(userId);
      video.likes += 1;
    }

    await video.save();

    res.json({ 
      message: isLiked ? "Video unliked" : "Video liked",
      likes: video.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Bookmark/Unbookmark Video ---
app.post("/api/videos/:id/bookmark", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.userId;
    const isBookmarked = video.bookmarkedBy.includes(userId);

    if (isBookmarked) {
      // Remove bookmark
      video.bookmarkedBy = video.bookmarkedBy.filter(id => id.toString() !== userId);
      video.bookmarks = Math.max(0, video.bookmarks - 1);
    } else {
      // Add bookmark
      video.bookmarkedBy.push(userId);
      video.bookmarks += 1;
    }

    await video.save();

    res.json({ 
      message: isBookmarked ? "Bookmark removed" : "Video bookmarked",
      bookmarks: video.bookmarks,
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Share Video (increment share count) ---
app.post("/api/videos/:id/share", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.shares += 1;
    await video.save();

    res.json({ 
      message: "Video shared",
      shares: video.shares
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Follow/Unfollow User ---
app.post("/api/users/:id/follow", auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      
      // Update user arrays
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId }
      });

      res.json({ 
        message: "Unfollowed successfully",
        isFollowing: false
      });
    } else {
      // Follow
      const follow = new Follow({
        follower: currentUserId,
        following: targetUserId
      });
      await follow.save();

      // Update user arrays
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId }
      });

      res.json({ 
        message: "Followed successfully",
        isFollowing: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Comments Routes ---
app.post("/api/videos/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = new Comment({
      text: text.trim(),
      videoId: req.params.id,
      userId: req.userId,
    });
    
    await comment.save();
    
    // Update video comment count
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { comments: 1 }
    });
    
    // Populate user data
    await comment.populate("userId", "username displayName avatar");
    
    res.status(201).json({ 
      message: "Comment added successfully", 
      comment: {
        id: comment._id,
        text: comment.text,
        user: {
          username: comment.userId.username,
          displayName: comment.userId.displayName,
          avatar: comment.userId.avatar
        },
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/videos/:id/comments", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const comments = await Comment.find({ videoId: req.params.id })
      .populate("userId", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      text: comment.text,
      user: {
        username: comment.userId.username,
        displayName: comment.userId.displayName,
        avatar: comment.userId.avatar
      },
      createdAt: comment.createdAt
    }));
    
    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- User Profile Routes ---
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username displayName avatar")
      .populate("following", "username displayName avatar");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const videoCount = await Video.countDocuments({ uploadedBy: user._id });
    
    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      followers: user.followers.length,
      following: user.following.length,
      videos: videoCount,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Get User's Videos ---
app.get("/api/users/:id/videos", async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const videos = await Video.find({ uploadedBy: req.params.id })
      .populate("uploadedBy", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const formattedVideos = videos.map(video => ({
      id: video._id,
      url: `${req.protocol}://${req.get('host')}/${video.filePath}`,
      caption: video.caption,
      likes: video.likes,
      comments: video.comments,
      createdAt: video.createdAt
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- Error Handling Middleware ---
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
  }
  res.status(500).json({ message: error.message });
});

// --- Create upload directories ---
const uploadDir = 'uploads/videos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, uploadDir)}`);
});

export default app;