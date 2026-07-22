import { UnauthorizedError } from "../../../domain/errors/index.js";

// Factory: receives its dependencies (repository, token service) instead of
// importing mongoose models directly, so the middleware only depends on
// domain-level ports and can be unit-tested with fakes.
export const createAuthMiddleware = ({ userRepository, tokenService }) => {
    const jwtMiddleware = async (req, res, next) => {
        try {
            const token = req.cookies?.token;
            if (!token) {
                throw new UnauthorizedError("Unauthorized. Missing Token.");
            }

            const decoded = tokenService.verify(token);
            const user = await userRepository.findById(decoded.userId);

            if (!user) {
                throw new UnauthorizedError("Unauthorized. User not found. ");
            }

            req.user = {
                id: user.id,
                apiKey: user.apiKey,
            };
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            if (error instanceof UnauthorizedError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(401).json({ message: "Unauthorized. Invalid token" });
        }
    };

    const apiKeyMiddleware = async (req, res, next) => {
        try {
            const apiKey = req.headers["x-api-key"] || req.query.apiKey;
            if (!apiKey) {
                return res.status(401).json({ message: "Missing API key" });
            }

            const user = await userRepository.findByApiKey(apiKey);
            if (!user) {
                return res.status(401).json({ message: "Invalid API key" });
            }

            req.user = { id: user.id, apiKey: user.apiKey };
            return next();
        } catch (error) {
            console.error("Error in apiKeyMiddleware:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    return { jwtMiddleware, apiKeyMiddleware };
};
