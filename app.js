import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import usersRoutes from "./modules/users/users.route.js";
import applicationsRoutes from "./modules/applications/applications.route.js";
import connectDB from "./config/db.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];


app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
await connectDB();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.send("Logging System API");
});

app.get("/api", (req, res) => {
    res.send("api");
});

app.use("/api/users", usersRoutes);
app.use("/api/applications", applicationsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
