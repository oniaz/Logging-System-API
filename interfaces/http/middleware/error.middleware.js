import { AppError } from "../../../domain/errors/index.js";

export const notFoundMiddleware = (req, res) => {
    res.status(404).json({ message: "Route not found" });
};

export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err instanceof AppError ? err.statusCode : err.statusCode || err.status || 500;
    let message = err.message || "Internal server error";

    if (err?.code === 11000) {
        statusCode = 409;
        message = "Resource already exists";
    }

    if (err?.name === "ValidationError" && !(err instanceof AppError)) {
        // Mongoose schema validation error (distinct from our domain ValidationError)
        statusCode = 400;
        message = err.message;
    }

    console.error("Request error:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({ message });
};
