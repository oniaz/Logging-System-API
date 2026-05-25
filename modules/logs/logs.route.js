import express from "express";
import { getLogsForApplication, createLogForApplication } from "./logs.controller.js";
import { apiKeyMiddleware, jwtMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", jwtMiddleware, getLogsForApplication);
router.post("/", apiKeyMiddleware, createLogForApplication);

export default router;
