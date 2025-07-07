const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const secretKey = process.env.JWT_SECRET;

// Register Controller
const register = async (req, res) => {
  try {
    console.log("Register request body:", req.body); // Log input

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists:", email); // Log duplicate
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();
    console.log("User saved successfully:", user.email); // Log success

    if (!secretKey) {
      console.error("JWT_SECRET missing!"); // Log if missing
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!secretKey) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
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
