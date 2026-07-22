import AppError from "./AppError.js";

export default class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}
