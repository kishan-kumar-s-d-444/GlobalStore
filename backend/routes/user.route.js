import express from "express";
import {login,register,getUserById } from "../controllers/user.controller.js";
const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.get('/:id', getUserById);
export default router;