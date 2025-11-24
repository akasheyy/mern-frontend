const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 📝 TEXT MESSAGE
    text: {
      type: String,
      default: null
    },

    // 🔊 AUDIO MESSAGE
    audioUrl: {
      type: String,
      default: null
    },
    audioDuration: {
      type: Number,
      default: null
    },

    // 📁 FILE MESSAGE
    fileUrl: {
      type: String,
      default: null
    },
    fileType: {
      type: String, // image, video, file
      default: null
    },
    fileName: {
      type: String,
      default: null
    },

    // 🔗 SHARED POST (NEW FEATURE)
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null
    },

    // message type
    type: {
      type: String,
      enum: ["text", "audio", "file", "shared_post"],
      default: "text"
    },

    // 🗑 Deleted for everyone
    deletedForEveryone: {
      type: Boolean,
      default: false
    },

    // ✓ single tick, ✓✓ double tick, ✓✓ blue tick
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent"
    },

    seenAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
