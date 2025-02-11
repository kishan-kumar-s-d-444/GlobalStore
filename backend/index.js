import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";

dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/user", userRoute);

// Port configuration
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    connectDB(); // Connect to the database
    console.log(`Server listening at port ${PORT}`);
});