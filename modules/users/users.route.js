import express from "express";
import { jwtMiddleware } from "../../middleware/auth.middleware.js";
import { register, login, logout, getApiKey } from "./users.controller.js";

const router = express.Router();

router.get("/api-key", jwtMiddleware, getApiKey)

router.post("/login", login)

router.post("/register", register)

router.post("/logout", logout)

export default router;
