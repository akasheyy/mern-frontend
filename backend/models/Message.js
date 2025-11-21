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
    },

    // 🔊 AUDIO MESSAGE
    audioUrl: {
      type: String,
    },
    audioDuration: {
      type: Number,
    },

    // 📁 FILE MESSAGE (image / video / pdf / doc etc.)
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String, // "image" | "video" | "file"
    },
    fileName: {
      type: String,
    },

    // message category
    type: {
      type: String,
      enum: ["text", "audio", "file"],
      default: "text"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
