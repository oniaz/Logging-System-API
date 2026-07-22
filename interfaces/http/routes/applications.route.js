import express from "express";

export const createApplicationsRouter = ({ applicationsController, jwtMiddleware, logsRouter }) => {
    const router = express.Router();

    router.get("/", jwtMiddleware, applicationsController.getAll);
    router.get("/:name", jwtMiddleware, applicationsController.getByName);
    router.post("/", jwtMiddleware, applicationsController.create);
    router.delete("/:name", jwtMiddleware, applicationsController.deleteByName);

    router.use("/:name/logs", logsRouter);

    return router;
};
