const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

// Create or get conversation
router.post("/start", auth, async (req, res) => {
  const { userId } = req.body;

  let chat = await Conversation.findOne({
    members: { $all: [req.userId, userId] }
  });

  if (!chat) {
    chat = await Conversation.create({
      members: [req.userId, userId]
    });
  }

  res.json(chat);
});

// Get conversation messages
router.get("/messages/:convId", auth, async (req, res) => {
  const msgs = await Message.find({ conversationId: req.params.convId });
  res.json(msgs);
});

// Send message
router.post("/message", auth, async (req, res) => {
  const { conversationId, text } = req.body;

  const msg = await Message.create({
    conversationId,
    sender: req.userId,
    text
  });

  res.json(msg);
});

module.exports = router;
