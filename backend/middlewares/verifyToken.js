// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        // Fallback to cookies
        token = req.cookies?.token;
    }

    console.log("Authorization header:", authHeader);
    console.log("Cookies on request:", req.cookies);
    console.log('Token found:', token);
  
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token found" });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
  
