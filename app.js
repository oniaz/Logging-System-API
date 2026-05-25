import express from "express";
import morgan from "morgan";

import usersRoutes from "./modules/users/users.route.js";
import applicationsRoutes from "./modules/applications/applications.route.js";
import logsRoutes from "./modules/logs/logs.route.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());


const PORT = 3000;


app.get("/", (req, res) => {
    res.send("Logging System API");
});

app.get("/api", (req, res) => {
    res.send("api");
});

app.use("/api/users", usersRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/applications/logs", logsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;