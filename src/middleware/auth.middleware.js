import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    // Verify the token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.userId); // ✅ Correct key is userId


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
