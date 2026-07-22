import AppError from "./AppError.js";

export default class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}
