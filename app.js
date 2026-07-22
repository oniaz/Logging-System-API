import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./config/env.js";
import { buildContainer } from "./main/container.js";

import { createUsersRouter } from "./interfaces/http/routes/users.route.js";
import { createApplicationsRouter } from "./interfaces/http/routes/applications.route.js";
import { createLogsRouter } from "./interfaces/http/routes/logs.route.js";
import { errorMiddleware, notFoundMiddleware } from "./interfaces/http/middleware/error.middleware.js";

export const createApp = () => {
    const app = express();

    const { usersController, applicationsController, logsController, jwtMiddleware, apiKeyMiddleware } =
        buildContainer();

    app.use(morgan("dev"));
    app.use(express.json());
    app.use(cookieParser());

    // NOTE: left permissive (mirrors original behavior). To restrict by
    // origin, swap this for the allowlist-based config using env.allowedOrigins:
    //
    // app.use(cors({
    //   origin: (origin, callback) => {
    //     if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
    //     return callback(new Error("Not allowed by CORS"));
    //   },
    //   credentials: true,
    // }));
    app.use(cors());

    app.get("/", (req, res) => {
        res.send("Logging System API");
    });

    app.get("/api", (req, res) => {
        res.send("api");
    });

    const logsRouter = createLogsRouter({ logsController, jwtMiddleware, apiKeyMiddleware });
    const applicationsRouter = createApplicationsRouter({ applicationsController, jwtMiddleware, logsRouter });
    const usersRouter = createUsersRouter({ usersController, jwtMiddleware });

    app.use("/api/users", usersRouter);
    app.use("/api/applications", applicationsRouter);

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
};

export default createApp;
