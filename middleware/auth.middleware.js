import jwt from 'jsonwebtoken';
import User from '../modules/users/users.model.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. Missing Token.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        // note
        // in case user was deleted but token is still valid
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized. User not found. ' });
        }
        req.user = {};

        req.user.id = decoded.userId;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized. Invalid token' });
    }
}

