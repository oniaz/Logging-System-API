import jwt from 'jsonwebtoken';
import User from '../modules/users/users.model.js';

export const jwtMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. Missing Token.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized. User not found. ' });
        }
        req.user = {
            id: user._id.toString(),
            apiKey: user.apiKey,
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized. Invalid token' });
    }
};

export const apiKeyMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.query.apiKey;
        if (!apiKey) {
            return res.status(401).json({ message: 'Missing API key' });
        }

        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(401).json({ message: 'Invalid API key' });
        }

        req.user = { id: user._id.toString(), apiKey: user.apiKey };
        return next();
    } catch (err) {
        console.error('Error in apiKeyMiddleware:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
