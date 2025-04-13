import express from "express";
import { createRoom, getAllRooms, getSingleRoom, getPublicRooms, joinRoom, makeRoomPublic, deleteRoom,leaveRoom } from "../controllers/room.controller.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();
router.route("/createroom").post(verifyToken, upload.roomImage, createRoom);
router.route("/myrooms").get(getAllRooms);
router.route("/single/:roomId").get(getSingleRoom);
router.route("/public").get(getPublicRooms);
router.post("/join/:roomId", verifyToken, joinRoom);
router.patch("/:roomId/make-public", verifyToken, makeRoomPublic);
router.delete("/:roomId", verifyToken, deleteRoom);
router.delete('/:roomId/leave',verifyToken, leaveRoom);


export default router;
