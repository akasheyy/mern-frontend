module.exports = async (req, res, next) => {
  const User = require("../models/User");

  try {
    await User.findByIdAndUpdate(req.userId, {
      lastActive: new Date()
    });
  } catch (err) {
    console.log("Last active update error:", err);
  }

  next();
};
