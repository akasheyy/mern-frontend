const jwt = require("jsonwebtoken");
const User = require("../models/User");  // <-- REQUIRED

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId
    req.userId = decoded.id;

    // Fetch full user (for comments & posts)
    const user = await User.findById(decoded.id).select("username email");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach full user object
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
