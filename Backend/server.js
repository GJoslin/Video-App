// server.js
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";

const app = express();
app.use(express.json());

// --- DB Connection ---
mongoose.connect("mongodb://localhost:27017/videoshare", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// --- Models ---
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const VideoSchema = new mongoose.Schema({
  title: String,
  filePath: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: { type: Number, default: 0 }, // Number of likes, default = 0
});
const CommentSchema = new mongoose.Schema({
  text: String,
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const User = mongoose.model("User", UserSchema);
const Video = mongoose.model("Video", VideoSchema);
const Comment = mongoose.model("Comment", CommentSchema);

// --- Middleware ---
const auth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// --- Auth Routes ---
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hash });
  await user.save();
  res.json({ message: "User registered" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });
  res.json({ token });
});

// --- Video Upload ---
const upload = multer({ dest: "uploads/" });
app.post("/upload", auth, upload.single("video"), async (req, res) => {
  const video = new Video({
    title: req.body.title,
    filePath: req.file.path,
    uploadedBy: req.userId,
  });
  await video.save();
  res.json({ message: "Video uploaded", video });
});

// --- Get Videos ---
app.get("/videos", async (req, res) => {
  const videos = await Video.find().populate("uploadedBy", "username");
  res.json(videos);
});

// --- Comments ---
app.post("/videos/:id/comment", auth, async (req, res) => {
  const comment = new Comment({
    text: req.body.text,
    videoId: req.params.id,
    userId: req.userId,
  });
  await comment.save();
  res.json({ message: "Comment added", comment });
});

app.get("/videos/:id/comments", async (req, res) => {
  const comments = await Comment.find({ videoId: req.params.id })
    .populate("userId", "username");
  res.json(comments);
});

// --- Start Server ---
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
app.use("/uploads", express.static("uploads"));
// --- Like a video ---
app.post("/videos/:id/like", auth, async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  video.likes += 1;
  await video.save();

  res.json({ message: "Video liked", likes: video.likes });
// Duplicate VideoSchema removed. The 'likes' field is now included in the original VideoSchema definition above.
});
