// Imports
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import roomRoute from "./routes/room.route.js";
import messageRoutes from "./routes/message.routes.js";

// For socket and server
import http from "http"; // ✅ You were mixing require and import
import { Server } from "socket.io";
import setupSocket from "./socket.js"; // ✅ Add .js extension if using ES module

// Initialize express app
const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/room", roomRoute);
app.use("/api/v1/message", messageRoutes);

// Server and socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
setupSocket(io);

// Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server listening at port ${PORT}`);
});
