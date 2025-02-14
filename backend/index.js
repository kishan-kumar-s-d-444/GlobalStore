import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import roomRoute from "./routes/room.route.js";


// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}

));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/room", roomRoute);
// Port configuration
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    connectDB(); // Connect to the database
    console.log(`Server listening at port ${PORT}`);
});