const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const secretKey =
  "cc3db5a9c829149a0ca2d0430a9a638bd8e7e4b93a8afb44b2e60083cfcbec0477421021e71b06b06a97482c47f249eeef3b0834b551187061db8d90461ef719";

// Register Controller
const register = async (req, res) => {
  try {
    console.log("Register request body:", req.body);
    let { name, username, email, password } = req.body;
    email = email.toLowerCase();
    username = username.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      console.log("User already exists:", email, username);
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, username, password });
    await user.save();
    console.log("User saved successfully:", user.email, user.username); // Log success

    if (!secretKey) {
      console.error("JWT_SECRET missing!"); // Log if missing
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Register ERROR:", error); // Detailed error log
    res.status(500).json({ message: "Server error", error: error.message }); // Temporarily expose error
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.toLowerCase();

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect username or password" });
      return;
    }

    if (!secretKey) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "7d",
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Current User Controller
const getCurrentUser = async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
