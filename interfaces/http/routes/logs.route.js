import express from "express";

export const createLogsRouter = ({ logsController, jwtMiddleware, apiKeyMiddleware }) => {
    const router = express.Router({ mergeParams: true });

    router.get("/", jwtMiddleware, logsController.getLogs);
    router.post("/", apiKeyMiddleware, logsController.createLog);

    return router;
};
