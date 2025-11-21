const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// =======================================================
// CLOUDINARY STORAGE: AUDIO (voice messages)
// =======================================================
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mern_chat_audio",
    resource_type: "video", // needed for audio/webm
    allowed_formats: ["mp3", "wav", "webm", "ogg"]
  }
});
const audioUpload = multer({ storage: audioStorage });

// =======================================================
// CLOUDINARY STORAGE: FILES (docs, zip, pdf, images, etc.)
// =======================================================
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mern_chat_files",
    resource_type: "auto", // handles everything
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx", "zip", "mp4"]
  }
});
const fileUpload = multer({ storage: fileStorage });

// =======================================================
// SEND FILE MESSAGE  → POST /api/messages/file/:id
// =======================================================
router.post("/file/:id", auth, fileUpload.single("file"), async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.id;

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      fileUrl: req.file.path,        // Cloudinary URL
      fileName: req.file.originalname,
      fileType: req.file.mimetype.includes("image")
        ? "image"
        : req.file.mimetype.includes("video")
        ? "video"
        : "file"
    });

    // Emit to socket listeners
    const io = req.app.get("io");
    io.to(receiverId).to(senderId).emit("new_message", msg);

    res.json(msg);
  } catch (err) {
    console.log("File upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================================================
// SEND VOICE MESSAGE  → POST /api/messages/voice/:id
// =======================================================
router.post(
  "/voice/:id",
  auth,
  audioUpload.single("audio"),
  async (req, res) => {
    try {
      const senderId = req.userId;
      const to = req.params.id;

      if (!req.file)
        return res.status(400).json({ message: "No audio uploaded" });

      const msg = await Message.create({
        sender: senderId,
        receiver: to,
        type: "audio",
        audioUrl: req.file.path,  // Cloudinary URL
        audioDuration: req.body.duration ? Number(req.body.duration) : null
      });

      const io = req.app.get("io");
      io.to(to).to(senderId).emit("new_message", msg);

      res.json(msg);
    } catch (err) {
      console.error("Audio upload error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// =======================================================
// GET RECENT CHATS
// =======================================================
router.get("/recent", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate("sender receiver", "username avatar lastActive");

    let chatMap = {};

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId ? msg.receiver : msg.sender;

      if (!chatMap[otherUser._id]) {
        chatMap[otherUser._id] = {
          user: otherUser,
          lastMessage:
            msg.text ||
            (msg.type === "audio" ? "🎤 Voice message" : "📎 File"),
          lastTime: msg.createdAt
        };
      }
    });

    res.json(Object.values(chatMap));
  } catch (err) {
    console.error("Recent chats error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// =======================================================
// GET FULL CHAT HISTORY WITH ONE USER
// =======================================================
router.get("/history/:id", auth, async (req, res) => {
  try {
    const otherUser = req.params.id;
    const currentUser = req.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: otherUser },
        { sender: otherUser, receiver: currentUser }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "username avatar");

    res.json(messages);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
