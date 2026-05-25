import express from "express";
import logsRoutes from "../logs/logs.route.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Get all applications");
});

router.get("/:name", (req, res) => {
    const { name } = req.params;
    res.send(`Get application by name: ${name}`);
});

router.post("/", (req, res) => {
    res.send('Create an application');
});

router.delete("/:name", (req, res) => {
    const { name } = req.params;
    res.send(`Delete an application by name: ${name}`);
});

router.use("/:name/logs", logsRoutes);

export default router;
