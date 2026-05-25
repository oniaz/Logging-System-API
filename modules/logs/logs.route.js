import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
    const { name } = req.params;
    res.send(`All logs for an application: ${name}`);
});

router.post("/", (req, res) => {
    const { name } = req.params;
    res.send(`Post a log for an application: ${name}`);
}); 


export default router;
