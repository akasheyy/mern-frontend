const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    
    image: { type: String, default: null },      // Cloudinary URL
    imageId: { type: String, default: null },    // ⬅️ NEW: Cloudinary public_id

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
