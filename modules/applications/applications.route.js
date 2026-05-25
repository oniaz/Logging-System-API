import express from "express";
import logsRoutes from "../logs/logs.route.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {getAllApplications, getApplicationByName, createApplication, deleteApplicationByName} from "./applications.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllApplications);

router.get("/:name", getApplicationByName);

router.post("/", createApplication);

router.delete("/:name", deleteApplicationByName);

router.use("/:name/logs", logsRoutes);

export default router;
