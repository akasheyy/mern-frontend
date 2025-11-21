require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const path = require("path");

const auth = require("./middleware/authMiddleware");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// -------------------- MIDDLEWARES --------------------
app.use(cors());
app.use(express.json());

// serve audio files
app.use(
  "/uploads/audio",
  express.static(path.join(__dirname, "uploads", "audio"))
);
app.use("/uploads1", express.static(path.join(__dirname, "uploads1")));

// -------------------- DATABASE CONNECT --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("DB Error:", err));

// -------------------- NORMAL ROUTES --------------------
app.get("/", (req, res) => {
  res.send("Backend running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", auth, postRoutes);
app.use("/api/user", auth, userRoutes);
app.use("/api/messages", auth, messageRoutes);

// -------------------- SOCKET SERVER SETUP --------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// make io available inside routes (req.app.get("io"))
app.set("io", io);

// -------------------- SOCKET AUTH --------------------
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Token missing"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id || decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid Token"));
  }
});

// -------------------- SOCKET EVENTS --------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.join(socket.userId);

  socket.on("send_message", async ({ to, text }) => {
    try {
      const Message = require("./models/Message");

      const msg = await Message.create({
        sender: socket.userId,
        receiver: to,
        text
      });

      io.to(to).to(socket.userId).emit("new_message", msg);
    } catch (err) {
      console.log("Message send error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
