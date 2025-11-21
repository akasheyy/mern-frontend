const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary"); // ⬅️ Make sure this file exists

// ===============================
// Create Post (with optional image)
// ===============================
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, content } = req.body;

    let imageUrl = null;
    let imageId = null;

    if (req.file) {
      imageUrl = req.file.path;
      imageId = req.file.filename; // Cloudinary public_id
    }

    const post = new Post({
      title,
      description,
      content,
      image: imageUrl,
      imageId: imageId,
      userId: req.userId
    });

    await post.save();

    res.json({ message: "Post created successfully", post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// ===============================
// Get all posts
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: { $ne: req.userId } })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// Get my posts
// ===============================
router.get("/myposts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.userId })
  .populate("userId", "username avatar")
  .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// Get single post
// ===============================
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    .populate("userId", "username avatar")

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ===============================
// Delete Post (also delete Cloudinary image)
// ===============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Delete image from Cloudinary
    if (post.imageId) {
      await cloudinary.uploader.destroy(post.imageId);
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// Update Post (with optional image replace)
// ===============================
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    const { title, description, content } = req.body;

    post.title = title;
    post.description = description;
    post.content = content;

    // If new image uploaded
    if (req.file) {
      if (post.imageId) {
        await cloudinary.uploader.destroy(post.imageId); // delete old image
      }
      post.image = req.file.path;
      post.imageId = req.file.filename;
    }

    await post.save();

    res.json({ message: "Post updated successfully", post });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// LIKE / UNLIKE
// ===============================
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(req.userId)) {
      post.likes = post.likes.filter(id => id.toString() !== req.userId);
      await post.save();
      return res.json({ message: "Post unliked", likes: post.likes.length });
    }

    post.likes.push(req.userId);
    await post.save();

    res.json({ message: "Post liked", likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// COMMENT
// ===============================
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      userId: req.userId,
      username: req.user.username,
      text
    });

    await post.save();

    res.json({ message: "Comment added", post });
  } catch (err) {
    console.log("COMMENT ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
