import express from "express";

export const createUsersRouter = ({ usersController, jwtMiddleware }) => {
    const router = express.Router();

    router.get("/api-key", jwtMiddleware, usersController.getApiKey);
    router.post("/login", usersController.login);
    router.post("/register", usersController.register);
    router.post("/logout", usersController.logout);

    return router;
};
