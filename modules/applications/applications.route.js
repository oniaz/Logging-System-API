import express from "express";
import logsRoutes from "../logs/logs.route.js";
import { jwtMiddleware } from "../../middleware/auth.middleware.js";
import {getAllApplications, getApplicationByName, createApplication, deleteApplicationByName} from "./applications.controller.js";

const router = express.Router();

router.get("/", jwtMiddleware, getAllApplications);

router.get("/:name", jwtMiddleware, getApplicationByName);

router.post("/", jwtMiddleware, createApplication);

router.delete("/:name", jwtMiddleware, deleteApplicationByName);

router.use("/:name/logs", logsRoutes);

export default router;
