import express from "express";

const router = express.Router();

// router.get("/", (req, res) => {
//     res.send("Users API");
// });

router.post("/login", (req, res) => {
    res.send("Login");
})

router.post("/register", (req, res) => {
    res.send("Register");
})
router.post("/logout", (req, res) => {
    res.send("Logout");
})

export default router;
