import express from "express";
import {login,register,getUserById,updateUser } from "../controllers/user.controller.js";
const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
export default router;