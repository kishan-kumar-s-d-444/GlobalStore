// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    console.log("Cookies on request:", req.cookies);
    console.log('Token found:', req.cookies.token);
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token found" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
  
