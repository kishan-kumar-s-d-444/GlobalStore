import express from "express";
import {createroom,getallrooms} from "../controllers/room.controller.js";
const router = express.Router();
router.route('/createroom').post(createroom);
router.route('/getallrooms').get(getallrooms);
export default router;